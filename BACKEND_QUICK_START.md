# Backend Quick Start Guide

## 🚀 Get Backend Running in 5 Minutes

### Prerequisites Check
```bash
# Check Python version (need 3.9+)
python3 --version

# Check if PostgreSQL is installed
psql --version

# If not installed, see BACKEND_DOCUMENTATION.md for installation
```

### Step 1: Create PostgreSQL Database

```bash
# Create database
createdb casepilot

# Verify it was created
psql -l | grep casepilot
```

### Step 2: Set Up Python Environment

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit .env file (use nano, vim, or your editor)
nano .env
```

**Update these values in `.env`:**
```bash
# If your PostgreSQL username is different, change it
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/casepilot

# Generate a secret key (run this command):
# python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=paste-generated-key-here
```

### Step 4: Start Backend Server

```bash
# Make sure virtual environment is activated
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Step 5: Create First User

Open a new terminal and run:

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

### Step 6: Test API

Open browser: **http://localhost:8000/docs**

You should see Swagger UI with all API endpoints!

### Step 7: Connect Frontend

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

## ✅ Verification Checklist

- [ ] PostgreSQL is running
- [ ] Database `casepilot` exists
- [ ] Virtual environment is activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file configured
- [ ] Backend server running on port 8000
- [ ] Can access http://localhost:8000/docs
- [ ] Created at least one user
- [ ] Frontend `.env` configured
- [ ] Frontend connects to backend

## 🔍 Troubleshooting

**"Database connection failed"**
- Check PostgreSQL is running: `brew services list` (macOS)
- Verify DATABASE_URL in `.env` matches your PostgreSQL setup
- Test connection: `psql casepilot`

**"Port 8000 already in use"**
```bash
# Find what's using port 8000
lsof -i :8000
# Kill it
kill -9 <PID>
```

**"Module not found"**
- Make sure virtual environment is activated
- Reinstall: `pip install -r requirements.txt`

**"Tables not created"**
- Check database connection in `.env`
- Restart backend server
- Check terminal for error messages

## 📚 Next Steps

- Read `BACKEND_DOCUMENTATION.md` for detailed explanations
- Explore API at http://localhost:8000/docs
- Create more users (lawyer, assistant)
- Test CRUD operations
- View data in PostgreSQL: `psql casepilot`

## 🎯 Common Commands

```bash
# Start backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# View database
psql casepilot
\dt  # List tables
SELECT * FROM users;  # View users

# Create user via API
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass","full_name":"Test","role":"lawyer"}'
```

Happy coding! 🚀

