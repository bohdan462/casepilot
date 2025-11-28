from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime
import os
import shutil
from pathlib import Path
from app.database import get_db
from app import models, schemas, auth
from app.models import UserRole

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def can_access_document(user: models.User, document: models.Document) -> bool:
    """Check if user can access a document"""
    from app import utils
    return utils.can_access_case(user, document.case)

@router.get("/", response_model=List[schemas.DocumentResponse])
async def get_documents(
    case_id: Optional[int] = None,
    document_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Document)
    
    if case_id:
        query = query.filter(models.Document.case_id == case_id)
        # Check case access
        case = db.query(models.Case).filter(models.Case.id == case_id).first()
        if case:
            from app import utils
            if not utils.can_access_case(current_user, case):
                raise HTTPException(status_code=403, detail="Not enough permissions")
    else:
        # Filter by accessible cases
        if current_user.role == UserRole.ASSISTANT:
            query = query.join(models.Case).join(models.CaseAssistant).filter(
                models.CaseAssistant.assistant_id == current_user.id
            )
        elif current_user.role == UserRole.LAWYER:
            query = query.join(models.Case).filter(
                or_(
                    models.Case.primary_attorney_id == current_user.id,
                    models.Case.id.in_(
                        db.query(models.CaseAssistant.case_id).filter(
                            models.CaseAssistant.assistant_id == current_user.id
                        )
                    )
                )
            )
    
    if document_type:
        query = query.filter(models.Document.document_type == document_type)
    
    documents = query.offset(skip).limit(limit).all()
    return documents

@router.get("/{document_id}", response_model=schemas.DocumentResponse)
async def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not can_access_document(current_user, document):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return document

@router.post("/", response_model=schemas.DocumentResponse)
async def upload_document(
    case_id: int,
    document_type: Optional[str] = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check if case exists and user can access it
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    from app import utils
    if not utils.can_access_case(current_user, case):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Save file
    file_extension = Path(file.filename).suffix
    file_name = f"{case_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_extension}"
    file_path = UPLOAD_DIR / file_name
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_size = file_path.stat().st_size
    file_type = file_extension[1:] if file_extension else None
    
    db_document = models.Document(
        name=file.filename,
        file_path=str(file_path),
        file_type=file_type,
        document_type=document_type,
        file_size=file_size,
        case_id=case_id,
        uploaded_by_id=current_user.id
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

@router.get("/{document_id}/download")
async def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not can_access_document(current_user, document):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        document.file_path,
        filename=document.name,
        media_type='application/octet-stream'
    )

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not can_access_document(current_user, document):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Only owners and uploaders can delete
    if current_user.role != UserRole.OWNER and document.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only document uploader or owner can delete")
    
    # Delete file
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    db.delete(document)
    db.commit()
    return {"message": "Document deleted"}

