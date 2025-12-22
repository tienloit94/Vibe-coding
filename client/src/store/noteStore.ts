import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface Note {
  _id: string;
  content: string;
  images?: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NoteStore {
  notes: Note[];
  loading: boolean;
  error: string | null;
  
  fetchNotes: () => Promise<void>;
  createNote: (content: string, images?: File[]) => Promise<void>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  loading: false,
  error: null,

  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ notes: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch notes', loading: false });
    }
  },

  createNote: async (content: string, images?: File[]) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('content', content);
      
      if (images) {
        images.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await axios.post(`${API_URL}/notes`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      set({ notes: [response.data, ...get().notes] });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create note' });
    }
  },

  updateNote: async (id: string, data: Partial<Note>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/notes/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      set({ 
        notes: get().notes.map(note => 
          note._id === id ? response.data : note
        )
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update note' });
    }
  },

  deleteNote: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      set({ notes: get().notes.filter(note => note._id !== id) });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete note' });
    }
  },

  togglePin: async (id: string) => {
    const note = get().notes.find(n => n._id === id);
    if (note) {
      await get().updateNote(id, { isPinned: !note.isPinned });
    }
  },
}));
