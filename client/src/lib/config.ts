// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get full API endpoint
export const getApiUrl = (path: string) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_URL}/${cleanPath}`;
};

// Get asset URL (for images, files, etc.)
export const getAssetUrl = (path?: string) => {
  if (!path) return undefined;
  // If path already includes http, return as is
  if (path.startsWith('http')) return path;
  // Otherwise, prepend API_URL
  return `${API_URL}${path}`;
};
