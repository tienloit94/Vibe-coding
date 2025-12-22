import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface BlockedUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface BlockStore {
  blockedUsers: BlockedUser[];
  loading: boolean;
  
  fetchBlockedUsers: () => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  isBlocked: (userId: string) => boolean;
}

export const useBlockStore = create<BlockStore>((set, get) => ({
  blockedUsers: [],
  loading: false,

  fetchBlockedUsers: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/block/blocked`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ blockedUsers: response.data, loading: false });
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      set({ loading: false });
    }
  },

  blockUser: async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/block/block/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await get().fetchBlockedUsers();
    } catch (error: any) {
      console.error('Error blocking user:', error);
      throw new Error(error.response?.data?.message || 'Failed to block user');
    }
  },

  unblockUser: async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/block/unblock/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await get().fetchBlockedUsers();
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  },

  isBlocked: (userId: string) => {
    return get().blockedUsers.some(user => user._id === userId);
  },
}));
