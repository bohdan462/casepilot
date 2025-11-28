from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas, auth
from app.models import UserRole

router = APIRouter()

def can_access_note(user: models.User, note: models.Note) -> bool:
    """Check if user can access a note"""
    from app import utils
    return utils.can_access_case(user, note.case)

@router.get("/", response_model=List[schemas.NoteResponse])
async def get_notes(
    case_id: int,
    pinned_only: bool = False,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check case access
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    from app import utils
    if not utils.can_access_case(current_user, case):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    query = db.query(models.Note).filter(models.Note.case_id == case_id)
    
    if pinned_only:
        query = query.filter(models.Note.is_pinned == True)
    
    notes = query.order_by(models.Note.is_pinned.desc(), models.Note.created_at.desc()).offset(skip).limit(limit).all()
    return notes

@router.get("/{note_id}", response_model=schemas.NoteResponse)
async def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if not can_access_note(current_user, note):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return note

@router.post("/", response_model=schemas.NoteResponse)
async def create_note(
    note_data: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check if case exists and user can access it
    case = db.query(models.Case).filter(models.Case.id == note_data.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    from app import utils
    if not utils.can_access_case(current_user, case):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_note = models.Note(
        content=note_data.content,
        case_id=note_data.case_id,
        author_id=current_user.id,
        is_pinned=note_data.is_pinned
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.put("/{note_id}", response_model=schemas.NoteResponse)
async def update_note(
    note_id: int,
    note_data: schemas.NoteUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if not can_access_note(current_user, note):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Only note author or owner can edit
    if current_user.role != UserRole.OWNER and note.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only note author or owner can edit")
    
    if note_data.content is not None:
        note.content = note_data.content
    if note_data.is_pinned is not None:
        # Only owners and lawyers can pin/unpin
        if note_data.is_pinned != note.is_pinned:
            if current_user.role == UserRole.ASSISTANT:
                raise HTTPException(status_code=403, detail="Assistants cannot pin notes")
            note.is_pinned = note_data.is_pinned
    
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{note_id}")
async def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if not can_access_note(current_user, note):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Only note author or owner can delete
    if current_user.role != UserRole.OWNER and note.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only note author or owner can delete")
    
    db.delete(note)
    db.commit()
    return {"message": "Note deleted"}

