import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface GroupMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  admin: GroupMember;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupMessage {
  _id: string;
  group: string;
  sender: GroupMember;
  content: string;
  messageType: "text" | "file";
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupStore {
  groups: Group[];
  selectedGroup: Group | null;
  groupMessages: GroupMessage[];
  loading: boolean;
  error: string | null;

  // Actions
  getGroups: () => Promise<void>;
  createGroup: (data: {
    name: string;
    description?: string;
    members: string[];
    type?: "chat" | "social";
  }) => Promise<Group>;
  selectGroup: (group: Group | null) => void;
  addMembers: (groupId: string, memberIds: string[]) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  getGroupMessages: (groupId: string) => Promise<void>;
  sendGroupMessage: (
    groupId: string,
    content: string,
    messageType?: "text" | "file",
    fileUrl?: string,
    fileName?: string
  ) => Promise<void>;
  addGroupMessage: (message: GroupMessage) => void;
  setError: (error: string | null) => void;
}

export const useGroupStore = create<GroupStore>((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  loading: false,
  error: null,

  getGroups: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/groups`, {
        withCredentials: true,
      });

      if (response.data.success) {
        set({ groups: response.data.groups });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to get groups";
      set({ error: message });
      console.error("Get groups error:", error);
    } finally {
      set({ loading: false });
    }
  },

  createGroup: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/groups`, data, {
        withCredentials: true,
      });

      if (response.data.success) {
        // Refresh groups list
        await get().getGroups();
        return response.data.group;
      }
      throw new Error("Failed to create group");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create group";
      set({ error: message });
      console.error("Create group error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  selectGroup: (group) => {
    set({ selectedGroup: group, groupMessages: [] });
    if (group) {
      get().getGroupMessages(group._id);
    }
  },

  addMembers: async (groupId, memberIds) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}/api/groups/${groupId}/members`,
        { members: memberIds },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Refresh groups list
        await get().getGroups();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to add members";
      set({ error: message });
      console.error("Add members error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  leaveGroup: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(
        `${API_URL}/api/groups/${groupId}/leave`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Remove from groups list
        set((state) => ({
          groups: state.groups.filter((g) => g._id !== groupId),
          selectedGroup:
            state.selectedGroup?._id === groupId ? null : state.selectedGroup,
        }));
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to leave group";
      set({ error: message });
      console.error("Leave group error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getGroupMessages: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `${API_URL}/api/groups/${groupId}/messages`,
        {
          withCredentials: true,
        }
      );
      set({ groupMessages: response.data });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch messages";
      set({ error: message });
      console.error("Get group messages error:", error);
    } finally {
      set({ loading: false });
    }
  },

  sendGroupMessage: async (
    groupId,
    content,
    messageType = "text",
    fileUrl,
    fileName
  ) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/groups/${groupId}/messages`,
        { content, messageType, fileUrl, fileName },
        { withCredentials: true }
      );

      // Add message to local state
      set((state) => ({
        groupMessages: [...state.groupMessages, response.data],
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send message";
      set({ error: message });
      console.error("Send group message error:", error);
      throw error;
    }
  },

  addGroupMessage: (message) => {
    set((state) => ({
      groupMessages: [...state.groupMessages, message],
    }));
  },

  setError: (error) => {
    set({ error });
  },
}));
