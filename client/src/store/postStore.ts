import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  images?: string[];
  video?: string;
  likes: any[];
  reactions?: Array<{
    user: any;
    type: "like" | "love" | "haha" | "wow" | "sad" | "angry";
    createdAt: string;
  }>;
  comments: Array<{
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    content: string;
    createdAt: string;
  }>;
  taggedUsers?: Array<{
    _id: string;
    name: string;
    avatar?: string;
  }>;
  visibility: "public" | "friends" | "private";
  createdAt: string;
  updatedAt: string;
}

interface PostStore {
  posts: Post[];
  loading: boolean;
  error: string | null;

  fetchFeed: () => Promise<void>;
  fetchUserPosts: (userId: string) => Promise<void>;
  createPost: (
    data:
      | FormData
      | {
          content: string;
          images?: string[];
          video?: string;
          visibility?: string;
        }
  ) => Promise<void>;
  updatePost: (
    postId: string,
    data: { content: string; taggedUsers?: string[] }
  ) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addReaction: (
    postId: string,
    type: "like" | "love" | "haha" | "wow" | "sad" | "angry"
  ) => Promise<void>;
  removeReaction: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  savePost: (postId: string, collection?: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  fetchSavedPosts: () => Promise<Post[]>;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  loading: false,
  error: null,

  fetchFeed: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/posts/feed`, {
        withCredentials: true,
      });
      set({ posts: response.data.posts, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch feed",
        loading: false,
      });
    }
  },

  fetchUserPosts: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/posts/user/${userId}`, {
        withCredentials: true,
      });
      set({ posts: response.data.posts, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch posts",
        loading: false,
      });
    }
  },

  createPost: async (data) => {
    try {
      const config: any = {
        withCredentials: true,
      };

      // If data is FormData, set appropriate header
      if (data instanceof FormData) {
        config.headers = { "Content-Type": "multipart/form-data" };
      }

      const response = await axios.post(`${API_URL}/api/posts`, data, config);
      set((state) => ({
        posts: [response.data, ...state.posts],
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to create post" });
      throw error;
    }
  },

  updatePost: async (postId, data) => {
    try {
      const response = await axios.put(`${API_URL}/api/posts/${postId}`, data, {
        withCredentials: true,
      });

      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? response.data : post
        ),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to update post" });
      throw error;
    }
  },

  toggleLike: async (postId) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/posts/${postId}/like`,
        {},
        {
          withCredentials: true,
        }
      );

      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? response.data : post
        ),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to like post" });
      throw error;
    }
  },

  addReaction: async (postId, type) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/posts/${postId}/reaction`,
        { type },
        { withCredentials: true }
      );

      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? response.data.post : post
        ),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to add reaction" });
      throw error;
    }
  },

  removeReaction: async (postId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/posts/${postId}/reaction`,
        { withCredentials: true }
      );

      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? response.data.post : post
        ),
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to remove reaction",
      });
      throw error;
    }
  },

  addComment: async (postId, content) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/posts/${postId}/comment`,
        { content },
        { withCredentials: true }
      );

      // Check for warning
      if (response.data.warning) {
        // Still update the post, but also show warning
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId ? response.data.post : post
          ),
        }));
        throw new Error(response.data.warning);
      }

      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? response.data.post || response.data : post
        ),
      }));
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to add comment",
      });
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      await axios.delete(`${API_URL}/api/posts/${postId}`, {
        withCredentials: true,
      });

      set((state) => ({
        posts: state.posts.filter((post) => post._id !== postId),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to delete post" });
      throw error;
    }
  },

  savePost: async (postId, collection = "default") => {
    try {
      await axios.post(
        `${API_URL}/api/posts/${postId}/save`,
        { collection },
        { withCredentials: true }
      );
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to save post" });
      throw error;
    }
  },

  unsavePost: async (postId) => {
    try {
      await axios.delete(`${API_URL}/api/posts/${postId}/save`, {
        withCredentials: true,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to unsave post" });
      throw error;
    }
  },

  fetchSavedPosts: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/posts/saved`, {
        withCredentials: true,
      });
      return response.data.posts;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch saved posts",
      });
      throw error;
    }
  },
}));
