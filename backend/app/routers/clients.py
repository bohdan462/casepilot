from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database import get_db
from app import models, schemas, auth
from app.auth import require_role
from app.models import UserRole

router = APIRouter()

@router.get("", response_model=List[schemas.ClientResponse])
async def get_clients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Client)
    
    if search:
        query = query.filter(
            or_(
                models.Client.name.ilike(f"%{search}%"),
                models.Client.email.ilike(f"%{search}%"),
                models.Client.phone.ilike(f"%{search}%")
            )
        )
    
    if is_active is not None:
        query = query.filter(models.Client.is_active == is_active)
    
    clients = query.offset(skip).limit(limit).all()
    return clients

@router.get("/{client_id}", response_model=schemas.ClientResponse)
async def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.post("", response_model=schemas.ClientResponse)
async def create_client(
    client_data: schemas.ClientCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Only owners and lawyers can create clients
    if current_user.role == UserRole.ASSISTANT:
        raise HTTPException(status_code=403, detail="Assistants cannot create clients")
    
    db_client = models.Client(
        name=client_data.name,
        email=client_data.email,
        phone=client_data.phone,
        address=client_data.address
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@router.put("/{client_id}", response_model=schemas.ClientResponse)
async def update_client(
    client_id: int,
    client_data: schemas.ClientUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Only owners and lawyers can update clients
    if current_user.role == UserRole.ASSISTANT:
        raise HTTPException(status_code=403, detail="Assistants cannot update clients")
    
    if client_data.name:
        client.name = client_data.name
    if client_data.email:
        client.email = client_data.email
    if client_data.phone:
        client.phone = client_data.phone
    if client_data.address:
        client.address = client_data.address
    if client_data.is_active is not None:
        client.is_active = client_data.is_active
    
    db.commit()
    db.refresh(client)
    return client

@router.delete("/{client_id}")
async def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([UserRole.OWNER]))
):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Check if client has cases
    cases_count = db.query(models.Case).filter(models.Case.client_id == client_id).count()
    if cases_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete client with existing cases")
    
    db.delete(client)
    db.commit()
    return {"message": "Client deleted"}

