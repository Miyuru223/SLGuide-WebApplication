import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('slguide_token');
    if (token) {
      API.get('/auth/verify')
        .then(res => setAdmin(res.data.admin))
        .catch(() => localStorage.removeItem('slguide_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await API.post('/auth/login', { username, password });
    localStorage.setItem('slguide_token', res.data.token);
    setAdmin(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('slguide_token');
    setAdmin(null);
  };

  const updateProfile = async (username, currentPassword, newPassword, recoveryQuestion, recoveryAnswer) => {
    const res = await API.put('/auth/profile', {
      username,
      currentPassword,
      newPassword,
      recoveryQuestion,
      recoveryAnswer
    });
    localStorage.setItem('slguide_token', res.data.token);
    setAdmin(res.data.admin);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
