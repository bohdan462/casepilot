# Creating Test Users via API

## Quick Method: Use the Script

A Python script is provided to automatically create all test users:

```bash
# Make sure backend is running first
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# In another terminal, run the script
cd backend
python create_test_users.py
```

This will create:
- **Owner**: owner@firm.com / password
- **Lawyer**: lawyer@firm.com / password  
- **Assistant**: assistant@firm.com / password

## Manual Method: Using curl

### Create Owner User

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

### Create Lawyer User

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

### Create Assistant User

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

## Using Swagger UI

1. Start backend: `uvicorn app.main:app --reload`
2. Open: http://localhost:8000/docs
3. Find `/api/auth/register` endpoint
4. Click "Try it out"
5. Enter user data in JSON format
6. Click "Execute"

## Verify Users Were Created

### Using psql

```bash
psql casepilot
SELECT id, email, full_name, role FROM users;
\q
```

### Using API

```bash
# First, login as owner to get token
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=owner@firm.com&password=password"

# Copy the access_token from response, then:
curl -X GET "http://localhost:8000/api/users" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Test Users Summary

| Email | Password | Role | Full Name |
|-------|----------|------|-----------|
| owner@firm.com | password | owner | John Owner |
| lawyer@firm.com | password | lawyer | Sarah Lawyer |
| assistant@firm.com | password | assistant | Mike Assistant |

These match the mock data users, so you can switch between mock and real API seamlessly!

