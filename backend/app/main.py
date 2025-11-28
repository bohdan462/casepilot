from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, users, cases, tasks, documents, notes, clients, companies

# Database tables are managed by Alembic migrations
# To create tables: alembic upgrade head

app = FastAPI(title="CasePilot API", version="1.0.0", redirect_slashes=False)

# CORS middleware
import os
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(cases.router, prefix="/api/cases", tags=["cases"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}




