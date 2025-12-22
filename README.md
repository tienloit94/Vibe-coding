# Real-time Chat Application

A comprehensive real-time chat application built with the MERN stack.

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- Socket.io for real-time communication
- JWT authentication with HttpOnly cookies
- Zod for validation

### Frontend
- React 18 with Vite
- TypeScript
- Tailwind CSS
- Shadcn UI (Radix UI components)
- Zustand for state management
- Axios for HTTP requests
- Lucide-react for icons

## Features
- User authentication (Register, Login, Logout)
- Real-time messaging with Socket.io
- Typing indicators
- Online/Offline status
- User list with search
- Responsive design

## Project Structure
```
/server   - Backend API and Socket.io server
/client   - React frontend application
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account

### Installation

1. **Clone the repository**
2. **Setup Backend** (see server/README.md)
3. **Setup Frontend** (see client/README.md)

## Environment Variables

See individual README files in `/server` and `/client` for required environment variables.
