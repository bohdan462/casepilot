# Quick Setup Summary

## ✅ Configuration Complete

### Backend `.env` File
**Location:** `backend/.env`

**Contents:**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/casepilot
SECRET_KEY=your-secret-key-here-change-in-production-use-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**⚠️ Important:** Update `DATABASE_URL` with your actual PostgreSQL username and password!

### Frontend `.env` File
**Location:** `frontend/.env`

**Contents:**
```bash
VITE_USE_MOCK_API=false
VITE_API_URL=http://localhost:8000/api
```

✅ **Mock mode is disabled** - Frontend will connect to real backend

---

## 🚀 Getting Started

### Step 1: Update Database Credentials

Edit `backend/.env`:
```bash
# Replace with your PostgreSQL credentials
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/casepilot
```

### Step 2: Start Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Step 3: Create Test Users

**Easy way (using script):**
```bash
# Install requests if needed
pip install requests

# Run the script
python create_test_users.py
```

**Manual way (using curl):**
```bash
# Owner
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@firm.com","password":"password","full_name":"John Owner","role":"owner"}'

# Lawyer
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"lawyer@firm.com","password":"password","full_name":"Sarah Lawyer","role":"lawyer"}'

# Assistant
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"assistant@firm.com","password":"password","full_name":"Mike Assistant","role":"assistant"}'
```

### Step 4: Start Frontend

```bash
cd frontend
npm run dev
```

---

## 🔐 Test Users (Same as Mock Data)

| Email | Password | Role |
|-------|----------|------|
| owner@firm.com | password | Owner |
| lawyer@firm.com | password | Lawyer |
| assistant@firm.com | password | Assistant |

---

## ✅ Verification Checklist

- [ ] PostgreSQL is running
- [ ] Database `casepilot` exists
- [ ] `backend/.env` has correct DATABASE_URL
- [ ] Backend server running on port 8000
- [ ] Can access http://localhost:8000/docs
- [ ] Test users created (check with script or curl)
- [ ] `frontend/.env` has `VITE_USE_MOCK_API=false`
- [ ] Frontend connects to backend (check browser console)

---

## 📚 Documentation

- **Backend Setup:** See `BACKEND_QUICK_START.md`
- **Creating Users:** See `backend/CREATE_USERS_GUIDE.md`
- **Full Backend Docs:** See `BACKEND_DOCUMENTATION.md`
- **Switching Modes:** See `SWITCHING_BETWEEN_MOCK_AND_REAL.md`

---

## 🎯 You're Ready!

Everything is configured. Just:
1. Update database credentials in `backend/.env`
2. Start backend
3. Create users
4. Start frontend

Data will now persist in PostgreSQL! 🚀

