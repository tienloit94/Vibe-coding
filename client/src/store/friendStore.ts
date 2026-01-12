import { create } from "zustand";
import axios from "axios";
import socket from "@/lib/socket";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

interface FriendRequest {
  _id: string;
  sender: User;
  receiver: User;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

interface OnlineUsers {
  [userId: string]: boolean;
}

interface FriendStore {
  friends: User[];
  friendRequests: FriendRequest[];
  searchResults: User[];
  onlineUsers: OnlineUsers;
  loading: boolean;
  error: string | null;

  // Actions
  getFriends: () => Promise<void>;
  getFriendRequests: () => Promise<void>;
  fetchFriendRequests: () => Promise<void>; // Alias for compatibility
  searchUsers: (query: string) => Promise<void>;
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>; // Alias
  rejectFriendRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>; // Alias
  clearSearchResults: () => void;
  setError: (error: string | null) => void;

  // Online status
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;

  // Socket event handlers
  handleNewFriendRequest: (request: FriendRequest) => void;
  handleFriendRequestAccepted: (data: { accepter: User }) => void;
}

export const useFriendStore = create<FriendStore>((set, get) => ({
  friends: [],
  friendRequests: [],
  searchResults: [],
  onlineUsers: {},
  loading: false,
  error: null,

  getFriends: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/friends`, {
        withCredentials: true,
      });

      if (response.data.success) {
        set({ friends: response.data.friends });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to get friends";
      set({ error: message });
      console.error("Get friends error:", error);
    } finally {
      set({ loading: false });
    }
  },

  getFriendRequests: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/friends/requests`, {
        withCredentials: true,
      });

      if (response.data.success) {
        set({ friendRequests: response.data.requests });
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to get friend requests";
      set({ error: message });
      console.error("Get friend requests error:", error);
    } finally {
      set({ loading: false });
    }
  },

  searchUsers: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/users/search`, {
        params: { q: query },
        withCredentials: true,
      });

      // Handle both response formats
      const users = response.data.users || response.data;
      set({ searchResults: Array.isArray(users) ? users : [] });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to search users";
      set({ error: message, searchResults: [] });
      console.error("Search users error:", error);
    } finally {
      set({ loading: false });
    }
  },

  sendFriendRequest: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}/api/friends/request/${userId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Remove from search results
        set((state) => ({
          searchResults: state.searchResults.filter((u) => u._id !== userId),
        }));
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to send friend request";
      set({ error: message });
      console.error("Send friend request error:", error);
    } finally {
      set({ loading: false });
    }
  },

  acceptFriendRequest: async (requestId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/api/friends/accept/${requestId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Remove from friend requests
        set((state) => ({
          friendRequests: state.friendRequests.filter(
            (r) => r._id !== requestId
          ),
        }));

        // Refresh friends list
        await get().getFriends();

        // Refresh chat users list
        const { useChatStore } = await import("./chatStore");
        await useChatStore.getState().fetchUsers();

        // Also refresh conversations
        await useChatStore.getState().fetchConversations();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to accept friend request";
      set({ error: message });
      console.error("Accept friend request error:", error);
      throw error; // Re-throw so UI can handle it
    } finally {
      set({ loading: false });
    }
  },

  rejectFriendRequest: async (requestId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/api/friends/reject/${requestId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Remove from friend requests
        set((state) => ({
          friendRequests: state.friendRequests.filter(
            (r) => r._id !== requestId
          ),
        }));
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to reject friend request";
      set({ error: message });
      console.error("Reject friend request error:", error);
    } finally {
      set({ loading: false });
    }
  },

  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  // Online status management
  setUserOnline: (userId: string) => {
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: true },
    }));
  },

  setUserOffline: (userId: string) => {
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: false },
    }));
  },

  setOnlineUsers: (userIds: string[]) => {
    const onlineUsers: OnlineUsers = {};
    userIds.forEach((id) => {
      onlineUsers[id] = true;
    });
    set({ onlineUsers });
  },

  // Aliases for compatibility
  fetchFriendRequests: async () => {
    return get().getFriendRequests();
  },

  acceptRequest: async (requestId: string) => {
    return get().acceptFriendRequest(requestId);
  },

  rejectRequest: async (requestId: string) => {
    return get().rejectFriendRequest(requestId);
  },

  handleNewFriendRequest: (request: FriendRequest) => {
    set((state) => ({
      friendRequests: [request, ...state.friendRequests],
    }));
  },

  handleFriendRequestAccepted: (data: { accepter: User }) => {
    // Add new friend to list
    set((state) => ({
      friends: [...state.friends, data.accepter],
    }));
  },
}));

// Socket event listeners
socket.on(
  "friend-request-received",
  (data: { sender: User; timestamp: Date }) => {
    console.log("🔔 Friend request received from:", data.sender.name);

    const newRequest: FriendRequest = {
      _id: Date.now().toString(), // Temporary ID
      sender: data.sender,
      receiver: {} as User, // Current user
      status: "pending",
      createdAt: data.timestamp.toString(),
    };

    useFriendStore.getState().handleNewFriendRequest(newRequest);

    // Optionally refresh the full list
    useFriendStore.getState().getFriendRequests();
  }
);

socket.on(
  "friend-request-accepted-notification",
  (data: { accepter: User; timestamp: Date }) => {
    console.log("✅ Friend request accepted by:", data.accepter.name);
    useFriendStore.getState().handleFriendRequestAccepted(data);

    // Refresh chat users list
    import("./chatStore").then(({ useChatStore }) => {
      useChatStore.getState().fetchUsers();
    });
  }
);
