import axios from 'axios';

const API = axios.create({
  baseURL: 'https://slguide-backend.onrender.com/api'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('slguide_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getImageUrl = (path) => {
  if (!path) return null;
  // Cloudinary URLs and any full URLs return as-is
  if (path.startsWith('http')) return path;
  // Fallback for any old local upload paths
  return `https://slguide-backend.onrender.com${path}`;
};

export default API;