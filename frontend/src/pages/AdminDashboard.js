import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import API, { getImageUrl } from '../utils/api';

const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: scale(0.6); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 4px 20px rgba(26,92,56,0.15); }
    50%      { box-shadow: 0 4px 32px rgba(26,92,56,0.3); }
  }
  @keyframes bgSlide {
    0%   { transform: scale(1.05) translateX(0); }
    50%  { transform: scale(1.08) translateX(-1%); }
    100% { transform: scale(1.05) translateX(0); }
  }
  @keyframes rowFadeIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* Topbar hero */
  .dash-topbar {
    position: relative;
    overflow: hidden;
    background: #0f3d24;
    padding: 2rem 2.5rem;
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .dash-topbar-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.18;
    animation: bgSlide 14s ease-in-out infinite;
    pointer-events: none;
  }
  .dash-topbar-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(10,40,20,0.85) 0%, rgba(15,61,36,0.6) 100%);
  }
  .dash-topbar-content {
    position: relative;
    z-index: 2;
  }
  .dash-topbar-content h1 {
    font-family: Playfair Display, serif;
    font-size: 2rem;
    font-weight: 800;
    color: white;
    margin: 0 0 0.3rem;
    letter-spacing: -0.5px;
    animation: slideRight 0.7s ease both;
  }
  .dash-topbar-content p {
    color: rgba(255,255,255,0.65);
    font-size: 0.88rem;
    margin: 0;
    animation: slideRight 0.7s ease 0.15s both;
  }
  .dash-topbar-right {
    position: relative;
    z-index: 2;
    text-align: right;
    animation: fadeUp 0.7s ease 0.2s both;
  }
  .dash-time {
    font-family: Playfair Display, serif;
    font-size: 2rem;
    font-weight: 700;
    color: #e8c97a;
    line-height: 1;
  }
  .dash-date {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.55);
    margin-top: 0.3rem;
    letter-spacing: 0.05em;
  }

  /* Stat cards */
  .stat-card-new {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    gap: 1.2rem;
    opacity: 0;
    animation: fadeUp 0.6s ease forwards;
    transition: transform 0.25s, box-shadow 0.25s;
    position: relative;
    overflow: hidden;
  }
  .stat-card-new::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 16px 16px 0 0;
  }
  .stat-card-new.green::before { background: linear-gradient(90deg, #1a5c38, #2d8a58); }
  .stat-card-new.gold::before  { background: linear-gradient(90deg, #c9a84c, #e8c97a); }
  .stat-card-new:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 40px rgba(26,92,56,0.13);
  }
  .stat-num {
    font-family: Playfair Display, serif;
    font-size: 2.2rem;
    font-weight: 800;
    color: #0f3d24;
    line-height: 1;
    animation: countUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  .stat-label { font-size: 0.78rem; color: #6b6b6b; margin-top: 0.2rem; }
  .stat-icon-new {
    width: 52px; height: 52px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }
  .stat-icon-new.green { background: linear-gradient(135deg, #e8f5ee, #d0eddc); }
  .stat-icon-new.gold  { background: linear-gradient(135deg, #fff8e6, #fef0c0); }

  /* Quick action cards */
  .action-card {
    border-radius: 14px;
    padding: 1.4rem 1.6rem;
    color: white;
    display: flex;
    align-items: center;
    gap: 1rem;
    text-decoration: none;
    transition: transform 0.25s, box-shadow 0.25s;
    opacity: 0;
    animation: fadeUp 0.6s ease forwards;
    position: relative;
    overflow: hidden;
  }
  .action-card::after {
    content: '→';
    position: absolute;
    right: 1.5rem;
    font-size: 1.2rem;
    opacity: 0;
    transform: translateX(-8px);
    transition: all 0.25s ease;
  }
  .action-card:hover { transform: translateY(-4px); }
  .action-card:hover::after { opacity: 0.7; transform: translateX(0); }
  .action-card.green {
    background: linear-gradient(135deg, #1a5c38 0%, #2d8a58 100%);
    box-shadow: 0 8px 24px rgba(26,92,56,0.3);
  }
  .action-card.green:hover { box-shadow: 0 16px 40px rgba(26,92,56,0.4); }
  .action-card.gold {
    background: linear-gradient(135deg, #92700c 0%, #c9a84c 100%);
    box-shadow: 0 8px 24px rgba(146,112,12,0.3);
  }
  .action-card.gold:hover { box-shadow: 0 16px 40px rgba(146,112,12,0.4); }

  .action-icon {
    width: 52px; height: 52px;
    border-radius: 12px;
    background: rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.6rem;
    flex-shrink: 0;
    backdrop-filter: blur(4px);
  }

  /* Table cards */
  .dash-table-card {
    background: white;
    border-radius: 14px;
    border: 1px solid #e8e8e8;
    overflow: hidden;
    opacity: 0;
    animation: fadeUp 0.6s ease forwards;
  }
  .dash-table-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.4rem;
    border-bottom: 1px solid #f0f0f0;
    background: #fafaf8;
  }
  .dash-table-head h2 {
    font-family: Playfair Display, serif;
    font-size: 1rem;
    color: #0f3d24;
    margin: 0;
  }

  .dash-row {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 0.8rem 1.4rem;
    border-bottom: 1px solid #f5f5f5;
    opacity: 0;
    animation: rowFadeIn 0.4s ease forwards;
    transition: background 0.2s;
  }
  .dash-row:last-child { border-bottom: none; }
  .dash-row:hover { background: #fafaf8; }

  .dash-row-img {
    width: 48px; height: 44px;
    border-radius: 8px;
    object-fit: cover;
    background: linear-gradient(135deg, #e8f5ee, #d4eddf);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
    flex-shrink: 0;
    overflow: hidden;
  }
  .dash-row-img img { width: 100%; height: 100%; object-fit: cover; }

  .dash-row-name { font-weight: 600; font-size: 0.875rem; color: #1a1a1a; }
  .dash-row-sub  { font-size: 0.72rem; color: #6b6b6b; margin-top: 0.15rem; }
  .dash-row-tag  { margin-left: auto; font-size: 0.72rem; color: #6b6b6b; white-space: nowrap; }

  /* Section label */
  .section-label {
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #aaa;
    font-weight: 600;
    margin-bottom: 0.8rem;
    animation: fadeUp 0.5s ease both;
  }
`;

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const h = String(time.getHours()).padStart(2,'0');
  const m = String(time.getMinutes()).padStart(2,'0');
  const s = String(time.getSeconds()).padStart(2,'0');

  return (
    <div className="dash-topbar-right">
      <div className="dash-time">{h}:{m}<span style={{ fontSize: '1.2rem', opacity: 0.6 }}>:{s}</span></div>
      <div className="dash-date">{days[time.getDay()]}, {months[time.getMonth()]} {time.getDate()} {time.getFullYear()}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ destinations: 0, hotels: 0, events: 0, featured_dest: 0, featured_hotels: 0, featured_events: 0 });
  const [recentDest, setRecentDest] = useState([]);
  const [recentHotels, setRecentHotels] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/destinations'),
      API.get('/hotels'),
      API.get('/events').catch(err => {
        console.error(err);
        return { data: [] };
      })
    ]).then(([dRes, hRes, eRes]) => {
      const dests = dRes.data;
      const hotels = hRes.data;
      const events = eRes.data || [];
      setStats({
        destinations: dests.length,
        hotels: hotels.length,
        events: events.length,
        featured_dest: dests.filter(d => d.featured).length,
        featured_hotels: hotels.filter(h => h.featured).length,
        featured_events: events.filter(e => e.featured).length,
      });
      setRecentDest(dests.slice(0, 5));
      setRecentHotels(hotels.slice(0, 5));
      setRecentEvents(events.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-layout">
      <style>{styles}</style>
      <AdminSidebar />
      <div className="admin-main">

        {/* Hero topbar with live background */}
        <div className="dash-topbar">
          <img
            className="dash-topbar-bg"
            src="https://images.pexels.com/photos/13391116/pexels-photo-13391116.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt=""
          />
          <div className="dash-topbar-overlay" />
          <div className="dash-topbar-content">
            <h1>Dashboard</h1>
            <p>Welcome back, Admin 👋 — Here's what's happening on SLGuide</p>
          </div>
          <LiveClock />
        </div>

        <div className="admin-content" style={{ padding: '2rem' }}>

          {/* Stat cards */}
          <div className="section-label" style={{ animationDelay: '0s' }}>Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '1.1rem', marginBottom: '2rem' }}>
            {[
              { icon: '🏛️', num: stats.destinations, label: 'Total Destinations', cls: 'green', delay: '0.05s' },
              { icon: '🏨', num: stats.hotels,       label: 'Total Hotels',       cls: 'green', delay: '0.12s' },
              { icon: '🎉', num: stats.events,       label: 'Total Events',       cls: 'green', delay: '0.19s' },
              { icon: '⭐', num: stats.featured_dest, label: 'Featured Destinations', cls: 'gold', delay: '0.26s' },
              { icon: '✨', num: stats.featured_hotels, label: 'Featured Hotels',  cls: 'gold', delay: '0.33s' },
              { icon: '🌟', num: stats.featured_events, label: 'Featured Events',  cls: 'gold', delay: '0.4s' },
            ].map(s => (
              <div className={`stat-card-new ${s.cls}`} key={s.label} style={{ animationDelay: s.delay }}>
                <div className={`stat-icon-new ${s.cls}`}>{s.icon}</div>
                <div>
                  <div className="stat-num" style={{ animationDelay: s.delay }}>{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="section-label" style={{ animationDelay: '0.3s' }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.1rem', marginBottom: '2rem' }}>
            <Link to="/admin/destinations" className="action-card green" style={{ animationDelay: '0.33s' }}>
              <div className="action-icon">🏛️</div>
              <div>
                <div style={{ fontWeight: 700, fontFamily: 'Playfair Display, serif', fontSize: '1.05rem' }}>Manage Destinations</div>
                <div style={{ opacity: 0.72, fontSize: '0.8rem', marginTop: '0.2rem' }}>Add, edit or remove historical sites</div>
              </div>
            </Link>
            <Link to="/admin/hotels" className="action-card gold" style={{ animationDelay: '0.4s' }}>
              <div className="action-icon">🏨</div>
              <div>
                <div style={{ fontWeight: 700, fontFamily: 'Playfair Display, serif', fontSize: '1.05rem' }}>Manage Hotels</div>
                <div style={{ opacity: 0.72, fontSize: '0.8rem', marginTop: '0.2rem' }}>Add, edit or remove accommodations</div>
              </div>
            </Link>
            <Link to="/admin/events" className="action-card green" style={{ animationDelay: '0.47s' }}>
              <div className="action-icon">🎉</div>
              <div>
                <div style={{ fontWeight: 700, fontFamily: 'Playfair Display, serif', fontSize: '1.05rem' }}>Manage Events</div>
                <div style={{ opacity: 0.72, fontSize: '0.8rem', marginTop: '0.2rem' }}>Add, edit or remove events & festivals</div>
              </div>
            </Link>
          </div>

          {/* Recent tables */}
          <div className="section-label" style={{ animationDelay: '0.5s' }}>Recent Entries</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.1rem' }}>

            {/* Recent Destinations */}
            <div className="dash-table-card" style={{ animationDelay: '0.52s' }}>
              <div className="dash-table-head">
                <h2>🏛️ Recent Destinations</h2>
                <Link to="/admin/destinations" style={{ fontSize: '0.78rem', color: '#1a5c38', fontWeight: 600 }}>View All →</Link>
              </div>
              {loading ? (
                <div className="loader" style={{ minHeight: 140 }}><div className="spinner" /></div>
              ) : recentDest.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa', fontSize: '0.85rem' }}>
                  No destinations yet
                </div>
              ) : recentDest.map((d, i) => (
                <div className="dash-row" key={d._id} style={{ animationDelay: `${0.54 + i * 0.07}s` }}>
                  <div className="dash-row-img">
                    {d.photos?.[0]
                      ? <img src={getImageUrl(d.photos[0])} alt="" />
                      : '🏛️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dash-row-name">{d.name}</div>
                    <div className="dash-row-sub">{d.category}</div>
                  </div>
                  <div className="dash-row-tag">{d.district}</div>
                </div>
              ))}
            </div>

            {/* Recent Hotels */}
            <div className="dash-table-card" style={{ animationDelay: '0.58s' }}>
              <div className="dash-table-head">
                <h2>🏨 Recent Hotels</h2>
                <Link to="/admin/hotels" style={{ fontSize: '0.78rem', color: '#1a5c38', fontWeight: 600 }}>View All →</Link>
              </div>
              {loading ? (
                <div className="loader" style={{ minHeight: 140 }}><div className="spinner" /></div>
              ) : recentHotels.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa', fontSize: '0.85rem' }}>
                  No hotels yet
                </div>
              ) : recentHotels.map((h, i) => (
                <div className="dash-row" key={h._id} style={{ animationDelay: `${0.6 + i * 0.07}s` }}>
                  <div className="dash-row-img">
                    {h.photos?.[0]
                      ? <img src={getImageUrl(h.photos[0])} alt="" />
                      : '🏨'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dash-row-name">{h.name}</div>
                    <div className="dash-row-sub" style={{ color: '#c9a84c' }}>{'★'.repeat(h.starRating)}</div>
                  </div>
                  <div className="dash-row-tag">{h.district}</div>
                </div>
              ))}
            </div>

            {/* Recent Events */}
            <div className="dash-table-card" style={{ animationDelay: '0.64s' }}>
              <div className="dash-table-head">
                <h2>🎉 Recent Events</h2>
                <Link to="/admin/events" style={{ fontSize: '0.78rem', color: '#1a5c38', fontWeight: 600 }}>View All →</Link>
              </div>
              {loading ? (
                <div className="loader" style={{ minHeight: 140 }}><div className="spinner" /></div>
              ) : recentEvents.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa', fontSize: '0.85rem' }}>
                  No events yet
                </div>
              ) : recentEvents.map((e, i) => (
                <div className="dash-row" key={e._id} style={{ animationDelay: `${0.66 + i * 0.07}s` }}>
                  <div className="dash-row-img">
                    {e.photos?.[0]
                      ? <img src={getImageUrl(e.photos[0])} alt="" />
                      : '🎉'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dash-row-name">{e.name}</div>
                    <div className="dash-row-sub">{e.category}</div>
                  </div>
                  <div className="dash-row-tag">{e.district}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}