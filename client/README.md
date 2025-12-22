# Chat Application - Frontend

React + TypeScript + Vite frontend with Shadcn UI and Tailwind CSS.

## Installation

```bash
cd client
npm install
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Update the environment variables:
   - `VITE_API_URL`: Backend API URL (default: http://localhost:5000)

## Running the Application

### Development mode
```bash
npm run dev
```

The app will run on [http://localhost:5173](http://localhost:5173)

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library (Radix UI based)
- **Zustand** - State management
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icons
- **React Router** - Routing
- **date-fns** - Date formatting

## Project Structure

```
src/
├── components/      # Reusable UI components
│   ├── ui/         # Shadcn UI components
│   ├── auth/       # Authentication components
│   └── chat/       # Chat components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── store/          # Zustand store
├── lib/            # Utilities and helpers
├── types/          # TypeScript types
└── App.tsx         # Main app component
```

## Shadcn UI Components

This project uses the following Shadcn components:
- Button
- Input
- Avatar
- ScrollArea
- Dialog
- DropdownMenu
- Label

To add more components:
```bash
npx shadcn-ui@latest add [component-name]
```
