# ✅ Configuration Complete!

## What's Been Set Up

### 1. Backend Configuration (`backend/.env`)

✅ **Created with database configuration:**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/casepilot
SECRET_KEY=your-secret-key-here-change-in-production-use-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**⚠️ Action Required:** Update the `DATABASE_URL` with your actual PostgreSQL username and password!

### 2. Frontend Configuration (`frontend/.env`)

✅ **Created with real API mode enabled:**
```bash
VITE_USE_MOCK_API=false
VITE_API_URL=http://localhost:8000/api
```

✅ **Mock mode is disabled** - Frontend will connect to real backend

### 3. Test User Creation Script

✅ **Created:** `backend/create_test_users.py`

This script automatically creates 3 test users matching the mock data:
- Owner: owner@firm.com / password
- Lawyer: lawyer@firm.com / password
- Assistant: assistant@firm.com / password

---

## 🚀 How to Create Users via API

### Method 1: Use the Script (Easiest)

```bash
# 1. Make sure backend is running
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# 2. In a new terminal, run the script
cd backend
python create_test_users.py
```

The script will:
- Check if backend is running
- Create all 3 test users
- Show success/error messages
- Skip users that already exist

### Method 2: Manual via curl

**Create Owner:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@firm.com",
    "password": "password",
    "full_name": "John Owner",
    "role": "owner"
  }'
```

**Create Lawyer:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lawyer@firm.com",
    "password": "password",
    "full_name": "Sarah Lawyer",
    "role": "lawyer"
  }'
```

**Create Assistant:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "assistant@firm.com",
    "password": "password",
    "full_name": "Mike Assistant",
    "role": "assistant"
  }'
```

### Method 3: Using Swagger UI

1. Start backend: `uvicorn app.main:app --reload`
2. Open: http://localhost:8000/docs
3. Find `/api/auth/register` endpoint
4. Click "Try it out"
5. Enter user JSON and click "Execute"

---

## 📋 Complete Setup Checklist

### Backend Setup

- [ ] PostgreSQL installed and running
- [ ] Database `casepilot` created
- [ ] `backend/.env` file exists ✅ (already done)
- [ ] Update `DATABASE_URL` in `backend/.env` with your credentials
- [ ] Virtual environment activated
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Backend server running: `uvicorn app.main:app --reload`
- [ ] Can access http://localhost:8000/docs

### User Creation

- [ ] Run `python create_test_users.py` OR create users manually
- [ ] Verify users in database: `psql casepilot` → `SELECT * FROM users;`

### Frontend Setup

- [ ] `frontend/.env` file exists ✅ (already done)
- [ ] `VITE_USE_MOCK_API=false` ✅ (already set)
- [ ] Frontend dependencies installed: `npm install`
- [ ] Frontend running: `npm run dev`
- [ ] Browser console shows: "🔌 Running in REAL API mode"

---

## 🔐 Test Users (Same as Mock Data)

These users match the mock data exactly, so you can switch between modes seamlessly:

| Email | Password | Role | Full Name |
|-------|----------|------|-----------|
| owner@firm.com | password | owner | John Owner |
| lawyer@firm.com | password | lawyer | Sarah Lawyer |
| assistant@firm.com | password | assistant | Mike Assistant |

---

## 🔄 Quick Commands Reference

### Start Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Create Users
```bash
cd backend
python create_test_users.py
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Check Database
```bash
psql casepilot
SELECT email, full_name, role FROM users;
\q
```

### Test API
```bash
curl http://localhost:8000/api/health
```

---

## ⚠️ Important Notes

1. **Database Credentials:** Update `backend/.env` with your actual PostgreSQL username and password
2. **Secret Key:** For production, generate a secure random key:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
3. **Backend Must Be Running:** The frontend needs the backend server running to work in real API mode
4. **Users Must Exist:** Create users before trying to login

---

## 🎯 Next Steps

1. **Update database credentials** in `backend/.env`
2. **Start PostgreSQL** (if not running)
3. **Start backend server**
4. **Create test users** (using script or curl)
5. **Start frontend**
6. **Login and test!**

---

## 📚 Documentation Files

- `BACKEND_DOCUMENTATION.md` - Complete backend guide
- `BACKEND_QUICK_START.md` - 5-minute setup
- `SWITCHING_BETWEEN_MOCK_AND_REAL.md` - Mode switching guide
- `backend/CREATE_USERS_GUIDE.md` - User creation details
- `QUICK_SETUP_SUMMARY.md` - Quick reference

---

## ✅ Summary

**What's Done:**
- ✅ Backend `.env` created with database config
- ✅ Frontend `.env` created with mock mode disabled
- ✅ User creation script ready
- ✅ Test users match mock data

**What You Need to Do:**
1. Update `DATABASE_URL` in `backend/.env`
2. Start PostgreSQL
3. Start backend
4. Create users
5. Start frontend

**You're all set!** 🚀

