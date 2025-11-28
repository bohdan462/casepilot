# Switching Between Mock Data and Real Database

## Overview

The CasePilot application supports two modes of operation:
1. **Mock Mode** - Uses in-memory data (no backend required)
2. **Real API Mode** - Connects to FastAPI backend with PostgreSQL

This guide explains how to switch between these modes.

---

## Mock Mode (Default)

### What is Mock Mode?

Mock mode uses JavaScript objects stored in memory to simulate API responses. This allows you to:
- Test the frontend without setting up a backend
- Develop UI/UX without database concerns
- Demo the application quickly
- Work offline

### How Mock Mode Works

**Location:** `frontend/src/services/mockApi.ts` and `mockStore.ts`

**Data Storage:** In-memory JavaScript objects (resets on page refresh)

**API Simulation:** Mock functions that return data with simulated delays

### Current Mock Mode Status

Mock mode is **enabled by default**. The frontend automatically uses mock data when:
- `VITE_USE_MOCK_API` is not set to `"false"`
- No `VITE_API_URL` is configured

### Using Mock Mode

**No configuration needed!** Just run:
```bash
cd frontend
npm run dev
```

The app will use mock data automatically.

**Test Credentials:**
- Owner: `owner@firm.com` / `password`
- Lawyer: `lawyer@firm.com` / `password`
- Assistant: `assistant@firm.com` / `password`

---

## Real API Mode (PostgreSQL Backend)

### What is Real API Mode?

Real API mode connects the frontend to the FastAPI backend, which stores data in PostgreSQL. This provides:
- Persistent data storage
- Real database relationships
- Production-like environment
- Data that survives page refreshes

### Prerequisites

Before switching to real API mode, you need:

1. **PostgreSQL installed and running**
2. **Backend server running** on `http://localhost:8000`
3. **Database created** (`casepilot`)
4. **At least one user created** in the database

### Step-by-Step: Switch to Real API Mode

#### Step 1: Set Up PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
createdb casepilot
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb casepilot
```

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install and create database via pgAdmin

#### Step 2: Configure Backend

```bash
cd backend

# Create virtual environment (if not done)
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env file
nano .env  # or use your editor
```

**Update `.env` file:**
```bash
# Adjust username/password to match your PostgreSQL setup
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/casepilot

# Generate secret key
SECRET_KEY=your-random-secret-key-here

ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

#### Step 3: Start Backend Server

```bash
# Make sure virtual environment is activated
cd backend
source venv/bin/activate

# Start server
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Verify it's working:**
- Open browser: http://localhost:8000/docs
- You should see Swagger UI with all endpoints

#### Step 4: Create Initial User

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

You should get a response with user data (no token needed for registration).

#### Step 5: Configure Frontend

**Create `frontend/.env` file:**
```bash
cd frontend
touch .env
```

**Add to `frontend/.env`:**
```bash
# Disable mock mode
VITE_USE_MOCK_API=false

# Point to backend API
VITE_API_URL=http://localhost:8000/api
```

#### Step 6: Restart Frontend

```bash
# Stop current frontend (Ctrl+C)
# Restart it
npm run dev
```

**Check console:** You should see:
```
🔌 Running in REAL API mode - connecting to backend
```

#### Step 7: Test Connection

1. Open frontend: http://localhost:3000
2. Login with: `owner@firm.com` / `password123`
3. Create a case - it should persist in PostgreSQL!

---

## Verifying Data Persistence

### Check Data in PostgreSQL

```bash
# Connect to database
psql casepilot

# View users
SELECT id, email, full_name, role FROM users;

# View cases
SELECT id, case_number, title, status FROM cases;

# View tasks
SELECT id, title, status, case_id FROM tasks;

# Exit
\q
```

### Test Persistence

1. **Create data in frontend** (case, task, etc.)
2. **Refresh the page** - data should still be there!
3. **Check PostgreSQL** - data should be in database
4. **Restart backend** - data should still exist

---

## Switching Back to Mock Mode

If you want to switch back to mock mode:

**Option 1: Remove/comment out frontend/.env**
```bash
# Delete or rename .env file
mv frontend/.env frontend/.env.backup
```

**Option 2: Set flag in frontend/.env**
```bash
# In frontend/.env
VITE_USE_MOCK_API=true
```

**Restart frontend:**
```bash
npm run dev
```

**Check console:** Should see:
```
🧪 Running in MOCK API mode - using local test data
```

---

## Troubleshooting

### Frontend Can't Connect to Backend

**Error:** "Network Error" or "Failed to fetch"

**Solutions:**
1. **Check backend is running:**
   ```bash
   curl http://localhost:8000/api/health
   # Should return: {"status":"ok"}
   ```

2. **Check CORS settings:**
   - Backend allows `http://localhost:3000` by default
   - If using different port, update `app/main.py`:
   ```python
   allow_origins=["http://localhost:3000", "http://localhost:5173"]
   ```

3. **Check frontend .env:**
   ```bash
   cat frontend/.env
   # Should have VITE_USE_MOCK_API=false
   ```

### Database Connection Errors

**Error:** "could not connect to server"

**Solutions:**
1. **Check PostgreSQL is running:**
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. **Verify DATABASE_URL in backend/.env:**
   ```bash
   # Format: postgresql://username:password@host:port/database
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/casepilot
   ```

3. **Test connection:**
   ```bash
   psql casepilot
   # If this works, database is accessible
   ```

### Authentication Errors

**Error:** "Invalid email or password" (when using real API)

**Solutions:**
1. **Make sure user exists in database:**
   ```bash
   psql casepilot
   SELECT email FROM users;
   ```

2. **Create user if missing:**
   ```bash
   curl -X POST "http://localhost:8000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"email":"owner@firm.com","password":"password123","full_name":"Owner","role":"owner"}'
   ```

3. **Check password is correct** (case-sensitive)

---

## Development Workflow

### Recommended Workflow

1. **Start with Mock Mode:**
   - Develop UI/UX features
   - Test user flows
   - No backend setup needed

2. **Switch to Real API:**
   - Test data persistence
   - Verify database relationships
   - Test authentication
   - Prepare for production

3. **Switch Back as Needed:**
   - Quick UI changes → Mock mode
   - Backend testing → Real API mode

### Quick Reference

**Mock Mode:**
```bash
# No backend needed
cd frontend
npm run dev
# Login with: owner@firm.com / password
```

**Real API Mode:**
```bash
# Terminal 1: Start backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Start frontend
cd frontend
# Make sure .env has VITE_USE_MOCK_API=false
npm run dev
# Login with user from database
```

---

## Summary

| Feature | Mock Mode | Real API Mode |
|---------|-----------|---------------|
| **Backend Required** | ❌ No | ✅ Yes |
| **Database Required** | ❌ No | ✅ PostgreSQL |
| **Data Persistence** | ❌ Resets on refresh | ✅ Persists |
| **Setup Time** | ⚡ Instant | 🕐 5-10 minutes |
| **Best For** | UI development | Full testing |
| **Default** | ✅ Yes | ❌ No |

### Quick Commands

**Enable Real API:**
```bash
# Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Frontend .env
echo "VITE_USE_MOCK_API=false" > frontend/.env
echo "VITE_API_URL=http://localhost:8000/api" >> frontend/.env
```

**Enable Mock Mode:**
```bash
# Remove or update frontend/.env
rm frontend/.env
# or set VITE_USE_MOCK_API=true
```

---

You now have full control over which mode to use! 🎉

