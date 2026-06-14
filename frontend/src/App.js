import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Hotels from './pages/Hotels';
import HotelDetail from './pages/HotelDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import AdminEvents from './pages/AdminEvents';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminDestinations from './pages/AdminDestinations';
import AdminHotels from './pages/AdminHotels';
import AdminProfile from './pages/AdminProfile';
import AdminForgotPassword from './pages/AdminForgotPassword';

import './index.css';

export default function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:id" element={<DestinationDetail />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/hotels/:id" element={<HotelDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/destinations" element={
              <ProtectedRoute><AdminDestinations /></ProtectedRoute>
            } />
            <Route path="/admin/hotels" element={
              <ProtectedRoute><AdminHotels /></ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute><AdminEvents /></ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute><AdminProfile /></ProtectedRoute>
            } />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          </Routes>
          <Toast />
        </BrowserRouter>
      </AuthProvider>
    </DarkModeProvider>
  );
}
