export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
  bio?: string;
}

export interface Reaction {
  _id: string;
  user: string;
  emoji: string;
  createdAt: Date;
}

export interface Message {
  _id: string;
  sender: User;
  receiver: User;
  content: string;
  messageType: 'text' | 'file' | 'image' | 'video' | 'audio';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  readAt?: Date;
  reactions?: Reaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
