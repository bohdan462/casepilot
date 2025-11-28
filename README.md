# CasePilot - Law Firm Management Application

A comprehensive internal tool for law firms to manage clients, cases, tasks, documents, and internal collaboration.

## Features

- **User Management**: Three role-based access levels (Owner, Lawyer, Assistant)
- **Case Management**: Complete case lifecycle tracking
- **Task Management**: Kanban-style task boards with assignments
- **Document Management**: Upload and organize case documents
- **Client Management**: Centralized client directory
- **Notes & Collaboration**: Internal notes and comments on cases
- **Role-Based Permissions**: UI adapts based on user role
- **AI-Ready Design**: Placeholder components for future AI features

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM
- **JWT** - Authentication
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Axios** - HTTP client

## Project Structure

```
Full Stack Law App/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application
│   │   ├── database.py      # Database configuration
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── auth.py          # Authentication utilities
│   │   └── routers/         # API route handlers
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── cases.py
│   │       ├── tasks.py
│   │       ├── documents.py
│   │       ├── notes.py
│   │       ├── clients.py
│   │       └── companies.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 12+

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and secret key
```

5. Create the database:
```bash
createdb casepilot
```

6. Run the backend server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Default Users

After setting up the database, you'll need to create users. You can use the registration endpoint or create them directly in the database.

Example API call to create an owner:
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

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Role Permissions

### Owner
- Full access to all data
- User management
- Can view all cases and tasks
- Firm-wide metrics

### Lawyer
- Can create and edit cases
- Can assign tasks to assistants
- Sees cases where they are primary attorney or team member
- Cannot access admin features

### Assistant
- Sees only assigned tasks and cases
- Can update task status
- Can upload documents and add notes
- Limited editing permissions

## AI-Ready Features

The application includes placeholder components for future AI features:
- **Case Overview**: AI summary panel (right sidebar)
- **Documents Tab**: AI document assistant (summarization, extraction)
- **Dashboard**: AI insights panel (optional)

These are marked as "Coming Soon" and are ready for integration when AI features are implemented.

## Development

### Backend Development
- API follows RESTful conventions
- All endpoints require authentication (except `/api/auth/login` and `/api/auth/register`)
- Role-based access control implemented in route handlers

### Frontend Development
- Components are organized by feature
- TypeScript provides type safety
- React Query handles data fetching and caching
- Tailwind CSS for styling

## Production Deployment

### Backend
1. Set `SECRET_KEY` to a strong random value
2. Configure production database URL
3. Set up proper CORS origins
4. Use a production ASGI server (e.g., Gunicorn with Uvicorn workers)

### Frontend
1. Build the production bundle:
```bash
npm run build
```
2. Serve the `dist` folder with a web server (Nginx, Apache, etc.)
3. Configure API proxy to point to backend

## License

This project is for internal use.

## Documentation

### Comprehensive Guides

- **[Backend Documentation](./BACKEND_DOCUMENTATION.md)** - Complete guide to FastAPI, PostgreSQL, and backend architecture
- **[Backend Quick Start](./BACKEND_QUICK_START.md)** - Get backend running in 5 minutes
- **[Switching Between Mock and Real Database](./SWITCHING_BETWEEN_MOCK_AND_REAL.md)** - How to switch between mock data and PostgreSQL
- **[CRUD Operations Guide](./CRUD_OPERATIONS.md)** - Complete CRUD implementation details
- **[Dev Mode Setup](./DEV_MODE_SETUP.md)** - Frontend development with mock data
- **[Quick Start Guide](./QUICK_START.md)** - Frontend quick start

### Key Topics Covered

**Backend:**
- FastAPI framework explanation
- PostgreSQL setup and configuration
- Database models and relationships
- API endpoints and authentication
- Local development setup
- Switching between mock and real database

**Frontend:**
- Mock API system
- React Query integration
- CRUD operations
- Role-based UI

## Support

For issues or questions, please contact the development team.




