import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface Product {
  _id: string;
  seller: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  condition: string;
  status: "available" | "sold" | "reserved";
  location?: string;
  views: number;
  likes: any[];
  createdAt: string;
  updatedAt: string;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;

  fetchProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) => Promise<void>;
  fetchFeaturedProducts: (limit?: number) => Promise<Product[]>;
  fetchProduct: (id: string) => Promise<Product>;
  createProduct: (data: FormData) => Promise<void>;
  updateProduct: (id: string, data: FormData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleLikeProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.category) queryParams.append("category", params.category);
      if (params.search) queryParams.append("search", params.search);

      const response = await axios.get(
        `${API_URL}/api/products?${queryParams.toString()}`
      );
      set({ products: response.data.products, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch products",
        loading: false,
      });
    }
  },

  fetchFeaturedProducts: async (limit = 5) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/products/featured?limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch featured products"
      );
    }
  },

  fetchProduct: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  },

  createProduct: async (data: FormData) => {
    try {
      const response = await axios.post(`${API_URL}/api/products`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        products: [response.data, ...state.products],
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create product",
      });
      throw error;
    }
  },

  updateProduct: async (id: string, data: FormData) => {
    try {
      const response = await axios.put(`${API_URL}/api/products/${id}`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        products: state.products.map((p) => (p._id === id ? response.data : p)),
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update product",
      });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/products/${id}`, {
        withCredentials: true,
      });
      set((state) => ({
        products: state.products.filter((p) => p._id !== id),
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete product",
      });
      throw error;
    }
  },

  toggleLikeProduct: async (id: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/products/${id}/like`,
        {},
        { withCredentials: true }
      );
      set((state) => ({
        products: state.products.map((p) => (p._id === id ? response.data : p)),
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to like product",
      });
      throw error;
    }
  },
}));
