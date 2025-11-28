from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas, auth
from app.models import UserRole

router = APIRouter()

@router.get("", response_model=List[schemas.CompanyResponse])
async def get_companies(
    skip: int = 0,
    limit: int = 100,
    company_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Company)
    
    if company_type:
        query = query.filter(models.Company.company_type == company_type)
    
    if search:
        query = query.filter(models.Company.name.ilike(f"%{search}%"))
    
    companies = query.offset(skip).limit(limit).all()
    return companies

@router.get("/{company_id}", response_model=schemas.CompanyResponse)
async def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.post("", response_model=schemas.CompanyResponse)
async def create_company(
    company_data: schemas.CompanyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Only owners and lawyers can create companies
    if current_user.role == UserRole.ASSISTANT:
        raise HTTPException(status_code=403, detail="Assistants cannot create companies")
    
    db_company = models.Company(
        name=company_data.name,
        company_type=company_data.company_type,
        contact_info=company_data.contact_info
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.post("/{company_id}/cases/{case_id}")
async def link_company_to_case(
    company_id: int,
    case_id: int,
    relationship_type: Optional[str] = None,
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
    
    # Check if company exists
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Check if already linked
    existing = db.query(models.CaseCompany).filter(
        models.CaseCompany.case_id == case_id,
        models.CaseCompany.company_id == company_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company already linked to case")
    
    case_company = models.CaseCompany(
        case_id=case_id,
        company_id=company_id,
        relationship_type=relationship_type
    )
    db.add(case_company)
    db.commit()
    return {"message": "Company linked to case"}

@router.delete("/{company_id}/cases/{case_id}")
async def unlink_company_from_case(
    company_id: int,
    case_id: int,
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
    
    case_company = db.query(models.CaseCompany).filter(
        models.CaseCompany.case_id == case_id,
        models.CaseCompany.company_id == company_id
    ).first()
    if not case_company:
        raise HTTPException(status_code=404, detail="Link not found")
    
    db.delete(case_company)
    db.commit()
    return {"message": "Company unlinked from case"}

