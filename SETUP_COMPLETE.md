# ✅ Setup Complete - Ready to Use Real Database!

## What's Been Configured

### ✅ Backend Configuration

**File:** `backend/.env`
- Database URL configured for PostgreSQL
- JWT secret key placeholder (update for production)
- Token expiration settings

**To Update Database Credentials:**
Edit `backend/.env` and change:
```bash
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/casepilot
```

### ✅ Frontend Configuration

**File:** `frontend/.env`
- Mock API disabled (`VITE_USE_MOCK_API=false`)
- Backend API URL configured (`http://localhost:8000/api`)

### ✅ Test User Creation Script

**File:** `backend/create_test_users.py`
- Automatically creates all 3 test users
- Matches mock data users exactly

---

## 🚀 Next Steps

### 1. Set Up PostgreSQL (if not done)

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14
createdb casepilot

# Linux
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb casepilot
```

### 2. Update Database Credentials

Edit `backend/.env`:
```bash
# Change these to match your PostgreSQL setup
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/casepilot
```

### 3. Start Backend

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

### 4. Create Test Users

**Option A: Use the script (Recommended)**
```bash
# In a new terminal
cd backend
python create_test_users.py
```

**Option B: Manual via curl**
```bash
# Create Owner
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@firm.com","password":"password","full_name":"John Owner","role":"owner"}'

# Create Lawyer
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"lawyer@firm.com","password":"password","full_name":"Sarah Lawyer","role":"lawyer"}'

# Create Assistant
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"assistant@firm.com","password":"password","full_name":"Mike Assistant","role":"assistant"}'
```

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

The frontend is now configured to use the real backend!

---

## 🔐 Test User Credentials

These match the mock data users:

| Email | Password | Role |
|-------|----------|------|
| owner@firm.com | password | Owner |
| lawyer@firm.com | password | Lawyer |
| assistant@firm.com | password | Assistant |

---

## ✅ Verification

### Check Backend is Running
```bash
curl http://localhost:8000/api/health
# Should return: {"status":"ok"}
```

### Check Users in Database
```bash
psql casepilot
SELECT email, full_name, role FROM users;
\q
```

### Check Frontend Console
Open browser console (F12) - should see:
```
🔌 Running in REAL API mode - connecting to backend
```

---

## 🔄 Switching Back to Mock Mode

If you want to use mock data again:

**Option 1:** Delete or rename `frontend/.env`
```bash
mv frontend/.env frontend/.env.backup
```

**Option 2:** Update `frontend/.env`
```bash
VITE_USE_MOCK_API=true
```

Then restart frontend.

---

## 📝 Files Created/Updated

- ✅ `backend/.env` - Database configuration
- ✅ `backend/.env.example` - Example configuration
- ✅ `backend/create_test_users.py` - User creation script
- ✅ `frontend/.env` - Frontend API configuration
- ✅ `backend/CREATE_USERS_GUIDE.md` - User creation guide

---

## 🎯 You're All Set!

1. ✅ Backend `.env` configured
2. ✅ Frontend `.env` configured (mock mode disabled)
3. ✅ User creation script ready
4. ✅ Test users match mock data

**Next:** Start PostgreSQL, update database credentials, start backend, create users, and start frontend!

Happy coding! 🚀

