# Quick Start Commands - Copy & Paste

## First Time Setup

### 1. Install Backend Dependencies
```powershell
cd d:\TestAI\server
npm install
```

### 2. Install Frontend Dependencies
```powershell
cd d:\TestAI\client
npm install
```

### 3. Setup Environment Files

**Backend (.env):**
```powershell
cd d:\TestAI\server
Copy-Item .env.example .env
# Then edit server\.env with your MongoDB URI and JWT secret
```

**Frontend (.env):**
```powershell
cd d:\TestAI\client
Copy-Item .env.example .env
```

## Daily Usage

### Option A: Two Separate Terminals

**Terminal 1 - Start Backend:**
```powershell
cd d:\TestAI\server
npm run dev
```

**Terminal 2 - Start Frontend:**
```powershell
cd d:\TestAI\client
npm run dev
```

### Option B: Single Command (if you install concurrently)

```powershell
# From project root (optional advanced setup)
npm install -g concurrently
concurrently "cd server && npm run dev" "cd client && npm run dev"
```

## Access Points

- **Frontend (React App):** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Status:** http://localhost:5000/api

## Test Users (Create via Registration)

**User 1:**
- Name: John Doe
- Email: john@example.com
- Password: password123

**User 2 (in incognito window):**
- Name: Jane Smith
- Email: jane@example.com  
- Password: password123

## Useful MongoDB Commands

**Start MongoDB (Windows):**
```powershell
net start MongoDB
```

**Stop MongoDB (Windows):**
```powershell
net stop MongoDB
```

**Check MongoDB Status:**
```powershell
mongosh --eval "db.adminCommand('ping')"
```

## Quick Checks

**Verify Node & npm:**
```powershell
node --version  # Should be v18+
npm --version
```

**Check if ports are in use:**
```powershell
# Check port 5000 (backend)
netstat -ano | findstr :5000

# Check port 5173 (frontend)
netstat -ano | findstr :5173
```

## Build for Production

**Backend:**
```powershell
cd d:\TestAI\server
# Set NODE_ENV=production in .env
npm start
```

**Frontend:**
```powershell
cd d:\TestAI\client
npm run build
npm run preview  # Preview the build
```

---

For detailed setup instructions, see SETUP_GUIDE.md
