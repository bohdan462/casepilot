# Dev Mode Setup - CasePilot

## ✅ What's Been Set Up

The application is now configured to run in **dev mode with mock data** - no backend required!

### Features:

1. **Mock API Service** - Simulates all API endpoints
2. **Test Data** - Pre-loaded with:
   - 3 test users (Owner, Lawyer, Assistant)
   - 3 clients
   - 3 cases
   - 5 tasks
   - 3 documents
   - 3 notes

3. **Test Credentials** - Ready to use:
   - `owner@firm.com` / `password` (Full access)
   - `lawyer@firm.com` / `password` (Case management)
   - `assistant@firm.com` / `password` (Task-focused)

4. **Auto-Detection** - Mock mode is enabled by default

## 🚀 Quick Start

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (already done!)
npm install

# 3. Start dev server
npm run dev
```

Visit `http://localhost:3000` and login with any test credentials!

## 📁 Files Created

- `frontend/src/services/mockData.ts` - All test data
- `frontend/src/services/mockApi.ts` - Mock API implementation
- `frontend/src/services/api.ts` - Updated to use mock by default
- `QUICK_START.md` - Detailed guide

## 🔄 Switching Modes

### To Use Mock API (Default):
No configuration needed - it's already set!

### To Use Real Backend:
Create `frontend/.env` file:
```
VITE_USE_MOCK_API=false
VITE_API_URL=http://localhost:8000/api
```

Or modify `frontend/src/services/mockApi.ts`:
```typescript
export const USE_MOCK_API = false
```

## 🎯 What You Can Test

- ✅ Login with different roles
- ✅ Dashboard (role-specific views)
- ✅ Cases list and detail
- ✅ Tasks management
- ✅ Clients directory
- ✅ Documents and notes
- ✅ User management (Owner only)
- ✅ Settings and preferences

## 💡 Tips

- Mock API simulates network delays (300-500ms)
- All data is stored in memory (refreshing resets to defaults)
- The UI works identically with real API - just switch modes!
- Check browser console for mode indicator

## 🐛 Troubleshooting

**Port conflict?**
```bash
npm run dev -- --port 3001
```

**Type errors?**
```bash
npm run lint
```

**Clear cache?**
```bash
rm -rf node_modules/.vite
npm run dev
```

Happy testing! 🎉




