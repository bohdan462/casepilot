from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from app.models import UserRole, CaseStatus, TaskStatus, TaskPriority

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Client Schemas
class ClientBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

class ClientResponse(ClientBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Company Schemas
class CompanyBase(BaseModel):
    name: str
    company_type: Optional[str] = None
    contact_info: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Case Schemas
class CaseBase(BaseModel):
    title: str
    description: Optional[str] = None
    case_type: Optional[str] = None
    status: CaseStatus = CaseStatus.OPEN
    opened_date: Optional[date] = None
    next_hearing_date: Optional[date] = None
    statute_of_limitations: Optional[date] = None

class CaseCreate(CaseBase):
    client_id: int
    primary_attorney_id: Optional[int] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    case_type: Optional[str] = None
    status: Optional[CaseStatus] = None
    primary_attorney_id: Optional[int] = None
    opened_date: Optional[date] = None
    next_hearing_date: Optional[date] = None
    statute_of_limitations: Optional[date] = None

class CaseResponse(CaseBase):
    id: int
    case_number: str
    client_id: int
    primary_attorney_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    client: Optional[ClientResponse] = None
    primary_attorney: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[date] = None

class TaskCreate(TaskBase):
    case_id: int
    assignee_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[date] = None
    assignee_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    case_id: int
    assignee_id: Optional[int] = None
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    case: Optional[CaseResponse] = None
    assignee: Optional[UserResponse] = None
    creator: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

# Document Schemas
class DocumentBase(BaseModel):
    name: str
    document_type: Optional[str] = None

class DocumentCreate(DocumentBase):
    case_id: int

class DocumentResponse(DocumentBase):
    id: int
    case_id: int
    file_path: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_by_id: int
    uploaded_at: datetime
    uploaded_by: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

# Note Schemas
class NoteBase(BaseModel):
    content: str
    is_pinned: bool = False

class NoteCreate(NoteBase):
    case_id: int

class NoteUpdate(BaseModel):
    content: Optional[str] = None
    is_pinned: Optional[bool] = None

class NoteResponse(NoteBase):
    id: int
    case_id: int
    author_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    author: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_cases: int
    open_cases: int
    total_tasks: int
    overdue_tasks: int
    tasks_due_today: int
    active_users: int




