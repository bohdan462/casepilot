# Copilot Instructions for CasePilot

## Project Overview
CasePilot is a full-stack law firm management tool. It consists of a FastAPI backend and a React/TypeScript frontend. The backend manages authentication, data models, and RESTful APIs. The frontend provides a role-based UI for case, client, document, and task management.

## Architecture & Key Patterns
- **Backend (`backend/app/`)**: FastAPI app with modular routers for each domain (`routers/`). Models are in `models.py`, schemas in `schemas.py`, and authentication in `auth.py`. All endpoints except login/register require JWT auth.
- **Frontend (`frontend/src/`)**: React app using TypeScript, React Query, and Tailwind. Pages are in `pages/`, reusable UI in `components/`, API logic in `services/`, and global state in `contexts/`.
- **Role-Based Access**: Three roles (Owner, Lawyer, Assistant) with permissions enforced both in backend route handlers and frontend UI logic.
- **Mock Data**: Frontend supports mock API/data for development. See `services/mockApi.ts`, `mockData.ts`, and `mockStore.ts`.
- **Database**: PostgreSQL via SQLAlchemy ORM. Migrations managed with Alembic (`alembic/`).

## Developer Workflows
- **Backend**:
  - Start: `uvicorn app.main:app --reload` (from `backend/`)
  - Install: `pip install -r requirements.txt`
  - Migrate: `alembic upgrade head`
  - Create users: Use `/api/auth/register` or `create_test_users.py`
- **Frontend**:
  - Start: `npm run dev` (from `frontend/`)
  - Build: `npm run build`
  - API endpoints configured in `services/api.ts`
- **Testing**: No formal test suite detected; use manual API calls or frontend dev server for validation.

## Conventions & Patterns
- **Backend routers**: Each domain (cases, users, tasks, etc.) has its own router file in `routers/`. Use dependency injection for DB/session and role checks.
- **Frontend pages**: Each major feature is a separate page component. Use React Query for all API data fetching.
- **Type Safety**: All frontend code is TypeScript. Shared types in `types/`.
- **Styling**: Tailwind CSS utility classes throughout frontend.
- **Environment Variables**: Backend uses `.env` (see `.env.example`). Frontend uses Vite env system.

## Integration Points
- **API**: All frontend/backend communication via REST endpoints. See Swagger docs at `/docs` when backend is running.
- **Authentication**: JWT tokens stored client-side, sent via `Authorization` header.
- **Document Uploads**: Handled via backend endpoints and `uploads/` directory.

## References
- [README.md](../../README.md) — setup, architecture, and role details
- [BACKEND_DOCUMENTATION.md](../../BACKEND_DOCUMENTATION.md) — backend details
- [CRUD_OPERATIONS.md](../../CRUD_OPERATIONS.md) — CRUD patterns
- [DEV_MODE_SETUP.md](../../DEV_MODE_SETUP.md) — frontend mock data/dev mode
- [SWITCHING_BETWEEN_MOCK_AND_REAL.md](../../SWITCHING_BETWEEN_MOCK_AND_REAL.md) — toggling mock/real data

## Example Patterns
- **Add a new API route**: Create a new file in `backend/app/routers/`, register it in `main.py`, define Pydantic schemas in `schemas.py`.
- **Add a new frontend page**: Create a component in `frontend/src/pages/`, add route in `App.tsx`, fetch data via `services/api.ts`.
- **Role checks**: Use backend dependency injection for role validation; in frontend, use context from `AuthContext.tsx`.

---

If any section is unclear or missing, please provide feedback to improve these instructions.