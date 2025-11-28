# Quick Start Guide - CasePilot

## 🚀 Running in Dev Mode (No Backend Required)

The app is configured to run with **mock data** by default, so you can test the frontend immediately without setting up a backend or database!

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Step 3: Login with Test Credentials

The app is running in **mock mode** with pre-configured test users:

#### Test Users:

1. **Owner Account** (Full access)
   - Email: `owner@firm.com`
   - Password: `password`

2. **Lawyer Account** (Case management)
   - Email: `lawyer@firm.com`
   - Password: `password`

3. **Assistant Account** (Task-focused)
   - Email: `assistant@firm.com`
   - Password: `password`

### What You Can Test:

✅ **Login/Logout** - Try different user roles  
✅ **Dashboard** - See role-specific views  
✅ **Cases List** - Browse and filter cases  
✅ **Case Detail** - View case information, tasks, documents, notes  
✅ **Tasks View** - See all tasks with filtering  
✅ **Clients List** - Browse client directory  
✅ **User Management** - (Owner only) Manage users  
✅ **Settings** - Update profile and preferences  

### Mock Data Includes:

- 3 test users (Owner, Lawyer, Assistant)
- 3 clients
- 3 cases with different statuses
- 5 tasks across cases
- 3 documents
- 3 notes (including pinned notes)

## 🔄 Switching to Real Backend

When you're ready to connect to the real backend:

1. **Option 1: Environment Variable**
   Create a `.env` file in the `frontend` directory:
   ```
   VITE_USE_MOCK_API=false
   VITE_API_URL=http://localhost:8000/api
   ```

2. **Option 2: Code Change**
   In `frontend/src/services/api.ts`, change:
   ```typescript
   export const USE_MOCK_API = false
   ```
event
## 📝 Notes

- All mock data is stored in `frontend/src/services/mockData.ts`
- Mock API responses simulate network delays (300-500ms)
- The UI will work exactly the same with real API - just switch the mode!
- Mock mode is perfect for:
  - UI/UX testing
  - Frontend development
  - Demo purposes
  - Testing different user roles

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Use a different port
npm run dev -- --port 3001
```

**Dependencies not installing?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors?**
```bash
# Check for type issues
npm run lint
```

Enjoy testing! 🎉




