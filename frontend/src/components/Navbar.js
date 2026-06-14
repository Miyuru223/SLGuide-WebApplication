import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="navbar" style={isHome ? {
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)',
      borderBottom: 'none',
      backdropFilter: 'none',
    } : {}}>
      <Link to="/" className="navbar-logo" style={isHome ? { color: 'white' } : {}}>
        SL<span style={isHome ? { color: '#e8c97a' } : {}}>Guide</span>
      </Link>
      <ul className="navbar-links">
        <li><Link to="/" style={isHome ? { color: 'rgba(255,255,255,0.85)' } : {}}>Home</Link></li>
        <li><Link to="/destinations" style={isHome ? { color: 'rgba(255,255,255,0.85)' } : {}}>Destinations</Link></li>
        <li><Link to="/hotels" style={isHome ? { color: 'rgba(255,255,255,0.85)' } : {}}>Hotels</Link></li>
        <li><Link to="/events" style={isHome ? { color: 'rgba(255,255,255,0.85)' } : {}}>Events</Link></li>
        {/* <li><Link to="/admin/login" className="btn-admin">Admin</Link></li> */}
      </ul>
    </nav>
  );
}