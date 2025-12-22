# Chat Application - Backend Server

Express.js backend with Socket.io for real-time chat functionality.

## Installation

```bash
cd server
npm install
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Update the environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `PORT`: Server port (default: 5000)
   - `CLIENT_URL`: Frontend URL for CORS (default: http://localhost:5173)

## Running the Server

### Development mode (with auto-reload)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (for sidebar)
- `GET /api/users/:id` - Get user by ID

### Messages
- `GET /api/messages/:userId` - Get conversation with a user
- `POST /api/messages/:userId` - Send message to a user

## Socket.io Events

### Client → Server
- `setup` - Initialize socket connection with user ID
- `join chat` - Join a chat room
- `typing` - User is typing
- `stop typing` - User stopped typing
- `new message` - Send a new message

### Server → Client
- `connected` - Connection established
- `user online` - User came online
- `user offline` - User went offline
- `message received` - New message received
- `typing` - Someone is typing
- `stop typing` - Someone stopped typing
