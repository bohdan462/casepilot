from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app import models, schemas, auth
from app.models import UserRole

router = APIRouter()

def can_access_task(user: models.User, task: models.Task) -> bool:
    """Check if user can access a task"""
    if user.role == UserRole.OWNER:
        return True
    if task.assignee_id == user.id:
        return True
    if task.created_by_id == user.id:
        return True
    # Check if user can access the case
    from app import utils
    return utils.can_access_case(user, task.case)

@router.get("", response_model=List[schemas.TaskResponse])
async def get_tasks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    assignee_id: Optional[int] = None,
    case_id: Optional[int] = None,
    priority: Optional[str] = None,
    overdue_only: bool = False,
    due_today: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Task)
    
    # Filter by role
    if current_user.role == UserRole.ASSISTANT:
        # Assistants only see tasks assigned to them
        query = query.filter(models.Task.assignee_id == current_user.id)
    elif current_user.role == UserRole.LAWYER:
        # Lawyers see tasks in their cases
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
    # Owners see all tasks (no filter)
    
    # Apply filters
    if status:
        query = query.filter(models.Task.status == status)
    if assignee_id:
        query = query.filter(models.Task.assignee_id == assignee_id)
    if case_id:
        query = query.filter(models.Task.case_id == case_id)
    if priority:
        query = query.filter(models.Task.priority == priority)
    if overdue_only:
        today = date.today()
        query = query.filter(
            and_(
                models.Task.due_date < today,
                models.Task.status != models.TaskStatus.DONE
            )
        )
    if due_today:
        today = date.today()
        query = query.filter(models.Task.due_date == today)
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks

@router.get("/{task_id}", response_model=schemas.TaskResponse)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if not can_access_task(current_user, task):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return task

@router.post("", response_model=schemas.TaskResponse)
async def create_task(
    task_data: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check if case exists and user can access it
    case = db.query(models.Case).filter(models.Case.id == task_data.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    from app import utils
    if not utils.can_access_case(current_user, case):
        raise HTTPException(status_code=403, detail="Not enough permissions to create task in this case")
    
    # Only owners and lawyers can create tasks
    if current_user.role == UserRole.ASSISTANT:
        raise HTTPException(status_code=403, detail="Assistants cannot create tasks")
    
    # Set assignee if not specified and user is lawyer (assign to themselves)
    assignee_id = task_data.assignee_id
    if not assignee_id and current_user.role == UserRole.LAWYER:
        assignee_id = current_user.id
    
    db_task = models.Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        due_date=task_data.due_date,
        case_id=task_data.case_id,
        assignee_id=assignee_id,
        created_by_id=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/{task_id}", response_model=schemas.TaskResponse)
async def update_task(
    task_id: int,
    task_data: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if not can_access_task(current_user, task):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Assistants can only update status and description
    if current_user.role == UserRole.ASSISTANT:
        if task.assignee_id != current_user.id:
            raise HTTPException(status_code=403, detail="Can only update your own tasks")
        if task_data.status:
            task.status = task_data.status
            if task_data.status == models.TaskStatus.DONE:
                task.completed_at = datetime.utcnow()
        if task_data.description is not None:
            task.description = task_data.description
    else:
        # Owners and lawyers can update all fields
        if task_data.title:
            task.title = task_data.title
        if task_data.description is not None:
            task.description = task_data.description
        if task_data.status:
            task.status = task_data.status
            if task_data.status == models.TaskStatus.DONE and not task.completed_at:
                task.completed_at = datetime.utcnow()
            elif task_data.status != models.TaskStatus.DONE:
                task.completed_at = None
        if task_data.priority:
            task.priority = task_data.priority
        if task_data.due_date:
            task.due_date = task_data.due_date
        if task_data.assignee_id:
            task.assignee_id = task_data.assignee_id
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if not can_access_task(current_user, task):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Only owners and task creators can delete
    if current_user.role != UserRole.OWNER and task.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only task creator or owner can delete")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}

