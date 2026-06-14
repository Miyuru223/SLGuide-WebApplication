import axios from 'axios';

//const API = axios.create({ baseURL: 'http://localhost:5000/api' });
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
  if (path.startsWith('http')) return path;
  //return `http://localhost:5000${path}`;
  return `https://slguide-backend.onrender.com${path}`;
};

export default API;
