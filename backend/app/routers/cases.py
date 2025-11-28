from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import date
from app.database import get_db
from app import models, schemas, auth, utils
from app.auth import require_role
from app.models import UserRole
import uuid

router = APIRouter()

def generate_case_number() -> str:
    """Generate unique case number"""
    year = date.today().year
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"CASE-{year}-{unique_id}"

@router.get("", response_model=List[schemas.CaseResponse])
async def get_cases(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    client_id: Optional[int] = None,
    attorney_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Case)
    
    # Filter by role
    if current_user.role == UserRole.ASSISTANT:
        # Assistants only see cases they're assigned to
        query = query.join(models.CaseAssistant).filter(
            models.CaseAssistant.assistant_id == current_user.id
        )
    elif current_user.role == UserRole.LAWYER:
        # Lawyers see cases where they're primary attorney or team member
        query = query.filter(
            or_(
                models.Case.primary_attorney_id == current_user.id,
                models.Case.id.in_(
                    db.query(models.CaseAssistant.case_id).filter(
                        models.CaseAssistant.assistant_id == current_user.id
                    )
                )
            )
        )
    # Owners see all cases (no filter)
    
    # Apply filters
    if status:
        query = query.filter(models.Case.status == status)
    if client_id:
        query = query.filter(models.Case.client_id == client_id)
    if attorney_id:
        query = query.filter(models.Case.primary_attorney_id == attorney_id)
    if search:
        query = query.filter(
            or_(
                models.Case.title.ilike(f"%{search}%"),
                models.Case.case_number.ilike(f"%{search}%")
            )
        )
    
    cases = query.offset(skip).limit(limit).all()
    return cases

@router.get("/{case_id}", response_model=schemas.CaseResponse)
async def get_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    if not utils.can_access_case(current_user, case):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return case

@router.post("", response_model=schemas.CaseResponse)
async def create_case(
    case_data: schemas.CaseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Only owners and lawyers can create cases
    if current_user.role == UserRole.ASSISTANT:
        raise HTTPException(status_code=403, detail="Assistants cannot create cases")
    
    # Generate case number
    case_number = generate_case_number()
    
    # Set primary attorney if not specified and user is lawyer
    primary_attorney_id = case_data.primary_attorney_id
    if not primary_attorney_id and current_user.role == UserRole.LAWYER:
        primary_attorney_id = current_user.id
    
    db_case = models.Case(
        case_number=case_number,
        title=case_data.title,
        description=case_data.description,
        case_type=case_data.case_type,
        status=case_data.status,
        client_id=case_data.client_id,
        primary_attorney_id=primary_attorney_id,
        opened_date=case_data.opened_date,
        next_hearing_date=case_data.next_hearing_date,
        statute_of_limitations=case_data.statute_of_limitations
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@router.put("/{case_id}", response_model=schemas.CaseResponse)
async def update_case(
    case_id: int,
    case_data: schemas.CaseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    if not utils.can_access_case(current_user, case):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Only owners and primary attorneys can edit
    if current_user.role != UserRole.OWNER and case.primary_attorney_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only primary attorney or owner can edit case")
    
    # Update fields
    if case_data.title:
        case.title = case_data.title
    if case_data.description is not None:
        case.description = case_data.description
    if case_data.case_type:
        case.case_type = case_data.case_type
    if case_data.status:
        case.status = case_data.status
    if case_data.primary_attorney_id:
        case.primary_attorney_id = case_data.primary_attorney_id
    if case_data.opened_date:
        case.opened_date = case_data.opened_date
    if case_data.next_hearing_date:
        case.next_hearing_date = case_data.next_hearing_date
    if case_data.statute_of_limitations:
        case.statute_of_limitations = case_data.statute_of_limitations
    
    db.commit()
    db.refresh(case)
    return case

@router.delete("/{case_id}")
async def delete_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([UserRole.OWNER]))
):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    db.delete(case)
    db.commit()
    return {"message": "Case deleted"}

@router.post("/{case_id}/assistants/{assistant_id}")
async def assign_assistant(
    case_id: int,
    assistant_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    if not utils.can_access_case(current_user, case):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check if assistant exists
    assistant = db.query(models.User).filter(
        models.User.id == assistant_id,
        models.User.role == UserRole.ASSISTANT
    ).first()
    if not assistant:
        raise HTTPException(status_code=404, detail="Assistant not found")
    
    # Check if already assigned
    existing = db.query(models.CaseAssistant).filter(
        models.CaseAssistant.case_id == case_id,
        models.CaseAssistant.assistant_id == assistant_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Assistant already assigned")
    
    case_assistant = models.CaseAssistant(case_id=case_id, assistant_id=assistant_id)
    db.add(case_assistant)
    db.commit()
    return {"message": "Assistant assigned"}

@router.delete("/{case_id}/assistants/{assistant_id}")
async def remove_assistant(
    case_id: int,
    assistant_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    if not utils.can_access_case(current_user, case):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    case_assistant = db.query(models.CaseAssistant).filter(
        models.CaseAssistant.case_id == case_id,
        models.CaseAssistant.assistant_id == assistant_id
    ).first()
    if not case_assistant:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    db.delete(case_assistant)
    db.commit()
    return {"message": "Assistant removed"}

