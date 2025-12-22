import { create } from 'zustand';
import { User, Message, Conversation } from '@/types';
import api from '@/lib/axios';
import socketService from '@/lib/socket';

interface ChatState {
  users: User[];
  conversations: Conversation[];
  selectedUser: User | null;
  messages: Record<string, Message[]>; // Changed to store messages per userId
  onlineUsers: string[];
  isTyping: boolean;
  typingUser: string | null;
  currentPage: number;
  hasMoreMessages: boolean;
  loadingMessages: boolean;
  
  fetchUsers: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  selectUser: (user: User | null) => void;
  fetchMessages: (userId: string, page?: number) => Promise<void>;
  loadMoreMessages: (userId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string, file?: File) => Promise<void>;
  addMessage: (message: Message) => void;
  setOnlineUsers: (users: string[]) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
  setTyping: (isTyping: boolean, userName?: string) => void;
  markAsRead: (userId: string) => Promise<void>;
  getUnreadCount: (userId: string) => number;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  updateMessageReaction: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  users: [],
  conversations: [],
  selectedUser: null,
  messages: {}, // Changed to object
  onlineUsers: [],
  isTyping: false,
  typingUser: null,
  currentPage: 1,
  hasMoreMessages: false,
  loadingMessages: false,

  fetchUsers: async () => {
    try {
      const response = await api.get('/users');
      set({ users: response.data.users });
      // Also fetch conversations for unread counts
      get().fetchConversations();
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  },

  fetchConversations: async () => {
    try {
      const response = await api.get('/messages/conversations');
      set({ conversations: response.data.conversations });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  },

  selectUser: (user: User | null) => {
    if (!user) {
      set({ selectedUser: null, currentPage: 1, hasMoreMessages: false });
      return;
    }
    set({ selectedUser: user, currentPage: 1, hasMoreMessages: false });
    get().fetchMessages(user._id, 1);
    // Mark messages as read when selecting user
    get().markAsRead(user._id);
  },

  fetchMessages: async (userId: string, page: number = 1) => {
    try {
      set({ loadingMessages: true });
      const response = await api.get(`/messages/${userId}?page=${page}&limit=50`);
      console.log('📥 Fetched messages for userId:', userId, 'count:', response.data.messages.length);
      set((state) => ({ 
        messages: {
          ...state.messages,
          [userId]: response.data.messages, // Store messages by userId
        },
        currentPage: page,
        hasMoreMessages: response.data.pagination?.hasMore || false,
        loadingMessages: false,
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      set({ loadingMessages: false });
    }
  },

  loadMoreMessages: async (userId: string) => {
    const { currentPage, hasMoreMessages, loadingMessages } = get();
    if (!hasMoreMessages || loadingMessages) return;

    try {
      set({ loadingMessages: true });
      const nextPage = currentPage + 1;
      const response = await api.get(`/messages/${userId}?page=${nextPage}&limit=50`);
      
      // Prepend older messages
      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: [...response.data.messages, ...(state.messages[userId] || [])],
        },
        currentPage: nextPage,
        hasMoreMessages: response.data.pagination?.hasMore || false,
        loadingMessages: false,
      }));
    } catch (error) {
      console.error('Failed to load more messages:', error);
      set({ loadingMessages: false });
    }
  },

  sendMessage: async (receiverId: string, content: string, file?: File) => {
    try {
      if (file) {
        // Upload file via API
        const formData = new FormData();
        formData.append('file', file);
        if (content) formData.append('content', content);

        const response = await api.post(`/messages/${receiverId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Emit via socket for real-time delivery
        socketService.emit('new-message', { 
          receiverId, 
          message: response.data.message 
        });
      } else {
        // Text message via socket
        socketService.emit('new-message', { receiverId, content });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },

  addMessage: (message: Message) => {
    set((state) => {
      // Determine which user's conversation this message belongs to
      const { user } = (window as any).__authStore?.getState?.() || {};
      const otherUserId = message.sender._id === user?._id 
        ? message.receiver._id 
        : message.sender._id;
      
      return {
        messages: {
          ...state.messages,
          [otherUserId]: [...(state.messages[otherUserId] || []), message],
        },
      };
    });
    // Refresh conversations to update unread count
    get().fetchConversations();
  },

  setOnlineUsers: (users: string[]) => {
    set({ onlineUsers: users });
  },

  updateUserStatus: (userId: string, isOnline: boolean) => {
    set((state) => ({
      users: state.users.map((user) =>
        user._id === userId ? { ...user, isOnline } : user
      ),
      selectedUser:
        state.selectedUser?._id === userId
          ? { ...state.selectedUser, isOnline }
          : state.selectedUser,
    }));
  },

  setTyping: (isTyping: boolean, userName?: string) => {
    set({ isTyping, typingUser: userName || null });
  },

  markAsRead: async (userId: string) => {
    try {
      await api.put(`/messages/read/${userId}`);
      // Refresh conversations to update unread count
      get().fetchConversations();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  getUnreadCount: (userId: string) => {
    const conversation = get().conversations.find(
      (conv) => conv.user._id === userId
    );
    return conversation?.unreadCount || 0;
  },

  addReaction: async (messageId: string, emoji: string) => {
    try {
      const response = await api.post(`/messages/${messageId}/reactions`, { emoji });
      // Socket will handle the real-time update
      socketService.emit('message-reaction', { 
        messageId, 
        receiverId: response.data.message.receiver._id === (window as any).__authStore?.getState?.().user?._id 
          ? response.data.message.sender._id 
          : response.data.message.receiver._id 
      });
    } catch (error) {
      console.error('Failed to add reaction:', error);
      throw error;
    }
  },

  updateMessageReaction: (updatedMessage: Message) => {
    set((state) => {
      const { user } = (window as any).__authStore?.getState?.() || {};
      const otherUserId = updatedMessage.sender._id === user?._id 
        ? updatedMessage.receiver._id 
        : updatedMessage.sender._id;
      
      const userMessages = state.messages[otherUserId] || [];
      const messageIndex = userMessages.findIndex(m => m._id === updatedMessage._id);
      
      if (messageIndex !== -1) {
        const newMessages = [...userMessages];
        newMessages[messageIndex] = updatedMessage;
        
        return {
          messages: {
            ...state.messages,
            [otherUserId]: newMessages,
          },
        };
      }
      
      return state;
    });
  },
}));
