# Backend Documentation - CasePilot API

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [FastAPI Framework](#fastapi-framework)
3. [Database Setup with PostgreSQL](#database-setup-with-postgresql)
4. [Project Structure](#project-structure)
5. [Database Models & Relationships](#database-models--relationships)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Authorization](#authentication--authorization)
8. [Switching Between Mock and Real Database](#switching-between-mock-and-real-database)
9. [Local Development Setup](#local-development-setup)
10. [Testing the Backend](#testing-the-backend)
11. [Common Operations](#common-operations)

---

## Architecture Overview

The CasePilot backend is built using **FastAPI**, a modern Python web framework that provides:
- **Automatic API documentation** (Swagger UI)
- **Type validation** with Pydantic
- **Async support** for high performance
- **Dependency injection** for clean code organization

### Key Components

```
Backend Architecture:
┌─────────────────────────────────────────┐
│         FastAPI Application             │
│         (app/main.py)                   │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
    ┌───▼───┐  ┌───▼───┐  ┌───▼───┐
    │Routers│  │ Models │  │Schemas │
    │       │  │(SQLAlc)│  │(Pydant)│
    └───┬───┘  └───┬───┘  └───┬───┘
        │           │           │
        └───────────┼───────────┘
                    │
            ┌───────▼───────┐
            │  PostgreSQL   │
            │   Database    │
            └───────────────┘
```

---

## FastAPI Framework

### What is FastAPI?

FastAPI is a Python web framework for building APIs. It's similar to Flask or Django but:
- **Faster** - Built on Starlette and Pydantic
- **Type-safe** - Uses Python type hints
- **Auto-documentation** - Generates OpenAPI/Swagger docs automatically
- **Modern** - Supports async/await natively

### How FastAPI Works in This Project

#### 1. Application Entry Point (`app/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create the FastAPI app instance
app = FastAPI(title="CasePilot API", version="1.0.0")

# Add CORS middleware (allows frontend to call API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers (API endpoints)
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(cases.router, prefix="/api/cases", tags=["cases"])
# ... more routers
```

**Key Concepts:**
- `FastAPI()` - Creates the application instance
- `CORS Middleware` - Allows cross-origin requests from frontend
- `include_router()` - Registers API endpoints from separate files

#### 2. Routers (API Endpoints)

Routers are organized by feature in `app/routers/`:

```python
# app/routers/cases.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

@router.get("/", response_model=List[schemas.CaseResponse])
async def get_cases(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Get database session
    # Get current authenticated user
    # Query cases from database
    cases = db.query(models.Case).all()
    return cases
```

**Key Concepts:**
- `APIRouter()` - Groups related endpoints
- `@router.get()` - Defines GET endpoint
- `Depends()` - Dependency injection (gets database session, current user)
- `response_model` - Validates response format using Pydantic schema

#### 3. Request/Response Models (Pydantic Schemas)

Pydantic schemas define the structure of request and response data:

```python
# app/schemas.py
from pydantic import BaseModel

class CaseBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: CaseStatus = CaseStatus.OPEN

class CaseCreate(CaseBase):
    client_id: int
    primary_attorney_id: Optional[int] = None

class CaseResponse(CaseBase):
    id: int
    case_number: str
    created_at: datetime
    
    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models
```

**Key Concepts:**
- `BaseModel` - Base class for all schemas
- `CaseCreate` - Schema for creating a case (request body)
- `CaseResponse` - Schema for case response (what API returns)
- `from_attributes` - Allows converting SQLAlchemy models to Pydantic

---

## Database Setup with PostgreSQL

### Why PostgreSQL?

PostgreSQL is a powerful, open-source relational database that:
- Handles complex relationships between data
- Provides ACID compliance (data integrity)
- Supports advanced queries and indexing
- Is production-ready and widely used

### Installation

#### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create database
createdb casepilot
```

### Database Connection

The backend connects to PostgreSQL using SQLAlchemy:

```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# Database URL format: postgresql://username:password@host:port/database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/casepilot")

# Create engine (connection pool)
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db  # Provide session to route handler
    finally:
        db.close()  # Close session after request
```

**Key Concepts:**
- `create_engine()` - Creates connection pool to database
- `SessionLocal` - Factory for creating database sessions
- `get_db()` - Dependency that provides database session to routes
- `yield` - Provides session, then closes it after request completes

### Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Database connection
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/casepilot

# JWT secret key (generate a random string)
SECRET_KEY=your-super-secret-key-change-this-in-production

# JWT algorithm
ALGORITHM=HS256

# Token expiration (in minutes)
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**Security Note:** Never commit `.env` to version control! It contains sensitive credentials.

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Makes app a Python package
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database connection and session management
│   ├── models.py            # SQLAlchemy database models (tables)
│   ├── schemas.py           # Pydantic schemas (request/response validation)
│   ├── auth.py              # Authentication utilities (JWT, password hashing)
│   ├── utils.py             # Helper functions
│   └── routers/             # API endpoint handlers
│       ├── __init__.py
│       ├── auth.py          # Login, register endpoints
│       ├── users.py         # User management endpoints
│       ├── cases.py         # Case CRUD endpoints
│       ├── tasks.py         # Task CRUD endpoints
│       ├── documents.py     # Document upload/download endpoints
│       ├── notes.py         # Note CRUD endpoints
│       ├── clients.py       # Client CRUD endpoints
│       └── companies.py     # Company management endpoints
├── alembic/                 # Database migration tool
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables (not in git)
```

---

## Database Models & Relationships

### What are Database Models?

Database models (SQLAlchemy) define the structure of your database tables. They map Python classes to database tables.

### Example: Case Model

```python
# app/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Case(Base):
    __tablename__ = "cases"  # Table name in database
    
    # Columns
    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(CaseStatus), default=CaseStatus.OPEN)
    
    # Foreign Keys (relationships)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    primary_attorney_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships (allows accessing related objects)
    client = relationship("Client", back_populates="cases")
    primary_attorney = relationship("User", foreign_keys=[primary_attorney_id])
    tasks = relationship("Task", back_populates="case")
    documents = relationship("Document", back_populates="case")
    notes = relationship("Note", back_populates="case")
```

### Database Relationships

The app uses these relationships:

```
User (Owner/Lawyer/Assistant)
  ├── primary_cases (one-to-many: User → Cases)
  ├── assigned_tasks (one-to-many: User → Tasks)
  └── notes (one-to-many: User → Notes)

Client
  └── cases (one-to-many: Client → Cases)

Case
  ├── client (many-to-one: Case → Client)
  ├── primary_attorney (many-to-one: Case → User)
  ├── tasks (one-to-many: Case → Tasks)
  ├── documents (one-to-many: Case → Documents)
  └── notes (one-to-many: Case → Notes)

Task
  ├── case (many-to-one: Task → Case)
  ├── assignee (many-to-one: Task → User)
  └── creator (many-to-one: Task → User)
```

### Creating Database Tables

When you start the FastAPI app, it automatically creates tables:

```python
# app/main.py
from app.database import Base, engine

# Create all tables defined in models
Base.metadata.create_all(bind=engine)
```

**Note:** For production, use Alembic migrations instead (see below).

---

## API Endpoints

### Endpoint Structure

All endpoints follow RESTful conventions:

```
GET    /api/cases          # List all cases
GET    /api/cases/{id}     # Get single case
POST   /api/cases          # Create new case
PUT    /api/cases/{id}     # Update case
DELETE /api/cases/{id}     # Delete case
```

### Example: Cases Endpoint

```python
# app/routers/cases.py
@router.get("/", response_model=List[schemas.CaseResponse])
async def get_cases(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Build query
    query = db.query(models.Case)
    
    # Apply filters
    if status:
        query = query.filter(models.Case.status == status)
    
    # Apply pagination
    cases = query.offset(skip).limit(limit).all()
    
    return cases
```

### Available Endpoints

**Authentication:**
- `POST /api/auth/login` - Login (returns JWT token)
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user info

**Cases:**
- `GET /api/cases` - List cases (with filters)
- `GET /api/cases/{id}` - Get case details
- `POST /api/cases` - Create case
- `PUT /api/cases/{id}` - Update case
- `DELETE /api/cases/{id}` - Delete case

**Tasks:**
- `GET /api/tasks` - List tasks (with filters)
- `GET /api/tasks/{id}` - Get task details
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

**Clients, Documents, Notes:** Similar CRUD operations

---

## Authentication & Authorization

### JWT (JSON Web Tokens)

The app uses JWT for authentication:

1. **User logs in** → Backend validates credentials
2. **Backend creates JWT token** → Contains user email and expiration
3. **Frontend stores token** → Sends in `Authorization` header
4. **Backend validates token** → On each request

### Password Hashing

Passwords are never stored in plain text:

```python
# app/auth.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

### Role-Based Access Control

Different endpoints check user roles:

```python
# Only owners can access
@router.get("/users")
async def get_users(
    current_user: models.User = Depends(require_role([UserRole.OWNER]))
):
    # Only owners can see this
    pass
```

---

## Switching Between Mock and Real Database

### Current Setup

The frontend can run in two modes:
1. **Mock Mode** - Uses in-memory data (no backend needed)
2. **Real API Mode** - Connects to FastAPI backend with PostgreSQL

### Frontend Configuration

**Mock Mode (Default):**
```typescript
// frontend/src/services/api.ts
// Automatically uses mock API when backend is not available
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'
```

**Real API Mode:**
Create `frontend/.env`:
```bash
VITE_USE_MOCK_API=false
VITE_API_URL=http://localhost:8000/api
```

### Backend Setup for Real Database

1. **Install PostgreSQL** (see above)

2. **Create Database:**
```bash
createdb casepilot
```

3. **Configure Environment:**
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

4. **Install Dependencies:**
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

5. **Start Backend:**
```bash
uvicorn app.main:app --reload
```

6. **Create Initial User:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@firm.com",
    "password": "password123",
    "full_name": "Firm Owner",
    "role": "owner"
  }'
```

7. **Update Frontend:**
- Set `VITE_USE_MOCK_API=false` in `frontend/.env`
- Restart frontend dev server

### Verifying Database Connection

Check if tables were created:
```bash
# Connect to PostgreSQL
psql casepilot

# List tables
\dt

# View users table
SELECT * FROM users;
```

---

## Local Development Setup

### Step-by-Step Setup

#### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install with default settings

#### 2. Create Database

```bash
# Create database
createdb casepilot

# Verify it exists
psql -l | grep casepilot
```

#### 3. Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### 4. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

**`.env` file content:**
```bash
# Database - adjust username/password as needed
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/casepilot

# JWT Secret - generate a random string
SECRET_KEY=your-super-secret-key-here-change-in-production

# JWT Settings
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**Note:** Default PostgreSQL username is usually `postgres`. If you set a password during installation, use that.

#### 5. Start Backend Server

```bash
# Make sure virtual environment is activated
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

#### 6. Verify Backend is Running

Open browser: `http://localhost:8000/docs`

You should see the Swagger UI with all API endpoints.

#### 7. Create Initial Data

**Create an owner user:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@firm.com",
    "password": "password123",
    "full_name": "Firm Owner",
    "role": "owner"
  }'
```

**Create a lawyer:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lawyer@firm.com",
    "password": "password123",
    "full_name": "Sarah Lawyer",
    "role": "lawyer"
  }'
```

#### 8. Connect Frontend to Backend

**Create `frontend/.env`:**
```bash
VITE_USE_MOCK_API=false
VITE_API_URL=http://localhost:8000/api
```

**Restart frontend:**
```bash
cd frontend
npm run dev
```

Now the frontend will use the real backend with PostgreSQL!

---

## Testing the Backend

### Using Swagger UI

1. Start backend: `uvicorn app.main:app --reload`
2. Open: `http://localhost:8000/docs`
3. Click "Authorize" button
4. Enter token from login response
5. Test endpoints directly in browser

### Using curl

**Login:**
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=owner@firm.com&password=password123"
```

**Get cases (with token):**
```bash
curl -X GET "http://localhost:8000/api/cases" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Python

```python
import requests

# Login
response = requests.post(
    "http://localhost:8000/api/auth/login",
    data={"username": "owner@firm.com", "password": "password123"}
)
token = response.json()["access_token"]

# Get cases
headers = {"Authorization": f"Bearer {token}"}
cases = requests.get("http://localhost:8000/api/cases", headers=headers)
print(cases.json())
```

---

## Common Operations

### Viewing Database Data

**Using psql:**
```bash
# Connect to database
psql casepilot

# List all tables
\dt

# View users
SELECT id, email, full_name, role FROM users;

# View cases
SELECT id, case_number, title, status FROM cases;

# View tasks
SELECT id, title, status, due_date FROM tasks;

# Exit
\q
```

### Resetting Database

**Drop and recreate:**
```bash
# Drop database
dropdb casepilot

# Create new database
createdb casepilot

# Restart backend (tables will be recreated)
uvicorn app.main:app --reload
```

### Database Migrations (Advanced)

For production, use Alembic for migrations:

```bash
# Initialize Alembic (already done)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Add new field"

# Apply migration
alembic upgrade head
```

### Troubleshooting

**Database connection error:**
- Check PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Verify DATABASE_URL in `.env` is correct
- Check username/password match your PostgreSQL setup

**Port already in use:**
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

**Import errors:**
- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

---

## Summary

### Quick Reference

**Start Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**Start Frontend (Mock Mode):**
```bash
cd frontend
npm run dev
```

**Start Frontend (Real API Mode):**
```bash
# Set VITE_USE_MOCK_API=false in frontend/.env
cd frontend
npm run dev
```

**View API Docs:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Database Connection:**
- Format: `postgresql://username:password@host:port/database`
- Default: `postgresql://postgres:postgres@localhost:5432/casepilot`

### Key Files

- `backend/app/main.py` - FastAPI application
- `backend/app/database.py` - Database connection
- `backend/app/models.py` - Database models
- `backend/app/schemas.py` - Request/response validation
- `backend/app/auth.py` - Authentication logic
- `backend/app/routers/` - API endpoints
- `backend/.env` - Environment variables (database URL, secrets)

### Next Steps

1. ✅ Set up PostgreSQL
2. ✅ Configure `.env` file
3. ✅ Start backend server
4. ✅ Create initial users
5. ✅ Connect frontend to backend
6. ✅ Test CRUD operations
7. ✅ View data in PostgreSQL

You're now ready to develop with a real database! 🚀

