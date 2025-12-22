# 🚀 Real-time Chat Application - Complete Setup Guide

This guide will help you set up and run the complete MERN stack chat application.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Either:
  - Local installation - [Download](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas account (cloud) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** (optional) - For version control
- A code editor (VS Code recommended)

## 📁 Project Structure

```
d:\TestAI\
├── server/               # Backend (Node.js + Express + Socket.io)
│   ├── config/          # Database & Socket.io config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & error middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # JWT utilities
│   ├── validators/      # Zod validation schemas
│   ├── server.js        # Main server file
│   └── package.json
│
└── client/              # Frontend (React + TypeScript + Vite)
    ├── src/
    │   ├── components/  # Reusable components
    │   │   ├── ui/      # Shadcn UI components
    │   │   └── chat/    # Chat-specific components
    │   ├── pages/       # Page components
    │   ├── store/       # Zustand state management
    │   ├── lib/         # Utilities (axios, socket)
    │   ├── types/       # TypeScript types
    │   └── App.tsx      # Main app component
    └── package.json
```

## 🔧 Installation Steps

### Step 1: Install Backend Dependencies

```powershell
# Navigate to server directory
cd d:\TestAI\server

# Install dependencies
npm install
```

### Step 2: Install Frontend Dependencies

```powershell
# Navigate to client directory (open new terminal or cd ..)
cd d:\TestAI\client

# Install dependencies
npm install
```

### Step 3: Environment Configuration

#### Backend Environment (.env)

```powershell
# In the server directory
cd d:\TestAI\server

# Copy the example env file
Copy-Item .env.example .env
```

Edit `server\.env` and update:

```env
PORT=5000
NODE_ENV=development

# For local MongoDB
MONGO_URI=mongodb://localhost:27017/chat-app

# For MongoDB Atlas (cloud)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app

# Generate a strong secret (you can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

#### Frontend Environment (.env)

```powershell
# In the client directory
cd d:\TestAI\client

# Copy the example env file
Copy-Item .env.example .env
```

Edit `client\.env`:

```env
VITE_API_URL=http://localhost:5000
```

## 🎯 Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**
```powershell
cd d:\TestAI\server
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd d:\TestAI\client
npm run dev
```

### Option 2: Using VS Code

1. Open VS Code in the project root: `code d:\TestAI`
2. Open two integrated terminals (Terminal → New Terminal)
3. In Terminal 1: `cd server && npm run dev`
4. In Terminal 2: `cd client && npm run dev`

## 🌐 Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Documentation:** http://localhost:5000 (shows API info)

## 📝 Testing the Application

### 1. Create Test Users

1. Open http://localhost:5173 in your browser
2. Click "Sign up" to create a new account
3. Fill in the registration form:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
4. Open a **new incognito/private window**
5. Create another user:
   - Name: Jane Smith
   - Email: jane@example.com
   - Password: password123

### 2. Test Real-time Chat

1. In John's window, select Jane from the user list
2. Send a message
3. In Jane's window, you should see the message appear instantly
4. Test typing indicators by typing in the message box
5. Test online/offline status by logging out one user

## 🛠️ Available Scripts

### Backend (server/)

```powershell
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Frontend (client/)

```powershell
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📦 Core Features Implemented

### ✅ Authentication
- User registration with name, email, password
- User login with JWT tokens
- HttpOnly cookie-based authentication
- Automatic avatar generation
- Protected routes

### ✅ Real-time Messaging
- Instant message delivery via Socket.io
- Message persistence in MongoDB
- Online/Offline user status
- Typing indicators ("User is typing...")
- Real-time user list updates

### ✅ UI Features
- Responsive design (mobile-friendly)
- User sidebar with search
- Chat area with message bubbles
- User avatars
- Timestamp display (e.g., "2 minutes ago")
- Clean, modern UI with Shadcn components

## 🔍 Troubleshooting

### Backend won't start
- **MongoDB connection error**: Ensure MongoDB is running
  ```powershell
  # For local MongoDB, start the service
  net start MongoDB
  ```
- **Port already in use**: Change the PORT in `.env`

### Frontend won't start
- **Port 5173 in use**: Vite will automatically suggest another port
- **API connection fails**: Check that backend is running on port 5000

### Socket.io connection issues
- Check browser console for errors
- Verify `VITE_API_URL` in client `.env` matches backend URL
- Ensure `CLIENT_URL` in server `.env` matches frontend URL

### CORS errors
- Verify `CLIENT_URL` in server `.env` is correct
- Clear browser cache and cookies
- Check browser console for specific CORS error messages

## 🔐 Security Notes

For production deployment:

1. **Change JWT_SECRET** to a strong random string
2. **Use MongoDB Atlas** instead of local MongoDB
3. **Enable HTTPS** on both frontend and backend
4. **Set NODE_ENV=production**
5. **Add rate limiting** to prevent abuse
6. **Validate and sanitize** all user inputs
7. **Use environment variables** for all secrets

## 📚 Tech Stack Summary

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.io (real-time)
- JWT (authentication)
- Bcrypt (password hashing)
- Zod (validation)

**Frontend:**
- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Shadcn UI (components)
- Zustand (state management)
- Axios (HTTP client)
- Socket.io Client (real-time)
- React Router (routing)

## 🎨 Customization

### Change Theme Colors

Edit `client/tailwind.config.js` to customize colors.

### Add More Shadcn Components

```powershell
cd client
npx shadcn-ui@latest add [component-name]
```

Available components: https://ui.shadcn.com/docs/components

## 📞 Support

If you encounter any issues:

1. Check the console logs (both browser and server terminal)
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check that all dependencies are installed (`npm install`)

---

**Happy Coding! 🎉**
