import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <h2>SL<span>Guide</span></h2>
        <p>Admin Panel</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">Overview</div>
        <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>
          <span>📊</span><span>Dashboard</span>
        </Link>
        <div className="nav-section">Manage</div>
        <Link to="/admin/destinations" className={isActive('/admin/destinations')}>
          <span>🏛️</span><span>Destinations</span>
        </Link>
        <Link to="/admin/hotels" className={isActive('/admin/hotels')}>
          <span>🏨</span><span>Hotels</span>
        </Link>
        <Link to="/admin/events" className={isActive('/admin/events')}>
          <span>🎉</span><span>Events</span>
        </Link>
        <div className="nav-section">Account</div>
        <Link to="/admin/profile" className={isActive('/admin/profile')}>
          <span>👤</span><span>Profile</span>
        </Link>
        <div className="nav-section">Site</div>
        <Link to="/" target="_blank">
          <span>🌐</span><span>View Site</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
