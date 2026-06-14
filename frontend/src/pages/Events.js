import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API, { getImageUrl } from '../utils/api';

const CATEGORIES = ['All', 'Religious', 'Cultural', 'Festival', 'National', 'Music', 'Food'];

const styles = `
  @keyframes logoDrop {
    0%   { opacity: 0; transform: translateY(-30px) rotate(-15deg) scale(0.7); }
    60%  { transform: translateY(6px) rotate(4deg) scale(1.05); }
    80%  { transform: translateY(-3px) rotate(-2deg) scale(0.98); }
    100% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
  }
  @keyframes logoPop {
    0%   { transform: scale(1) rotate(0deg); }
    40%  { transform: scale(1.35) rotate(-8deg); }
    65%  { transform: scale(1.28) rotate(6deg); }
    80%  { transform: scale(1.32) rotate(-3deg); }
    100% { transform: scale(1.3) rotate(0deg); }
  }
  @keyframes titleSlide {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes subtitleFade {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 0.75; transform: translateY(0); }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 10px rgba(232,201,122,0.3), 0 4px 20px rgba(0,0,0,0.3); }
    50%       { box-shadow: 0 0 28px rgba(232,201,122,0.75), 0 4px 20px rgba(0,0,0,0.3); }
  }
  @keyframes cardFadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes countFade {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes datePulse {
    0%,100% { transform: scale(1); }
    50%      { transform: scale(1.05); }
  }

  .page-logo {
    animation: logoDrop 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards,
               glowPulse 3s ease-in-out 1s infinite;
    cursor: pointer;
  }
  .page-logo:hover {
    animation: logoPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards,
               glowPulse 1.5s ease-in-out infinite;
  }
  .page-title  { animation: titleSlide 0.8s ease 0.3s both; }
  .page-subtitle { animation: subtitleFade 0.8s ease 0.6s both; }

  .event-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #e8e0d0;
    cursor: pointer;
    opacity: 0;
    animation: cardFadeUp 0.6s ease forwards;
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    position: relative;
  }
  .event-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 24px 52px rgba(26,92,56,0.15);
    border-color: transparent;
  }
  .event-card:hover .card-img-inner { transform: scale(1.06); }
  .event-card:hover .explore-btn { opacity: 1; transform: translateY(0); }

  .card-img-wrap {
    width: 100%; height: 200px; overflow: hidden;
    background: linear-gradient(135deg, #fdf0e0, #fbe0c8);
    position: relative;
  }
  .card-img-inner {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.5s ease; display: block;
  }
  .card-img-placeholder {
    width: 100%; height: 100%; display: flex;
    align-items: center; justify-content: center;
    font-size: 3.5rem;
    background: linear-gradient(135deg, #fdf0e0, #fbe0c8);
  }

  /* Date badge */
  .date-badge {
    position: absolute; top: 12px; left: 12px;
    background: rgba(255,255,255,0.95);
    border-radius: 10px; padding: 0.4rem 0.7rem;
    text-align: center; min-width: 56px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: datePulse 2.5s ease-in-out infinite;
  }
  .date-badge-month {
    font-size: 0.65rem; font-weight: 700; color: #c9a84c;
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .date-badge-day {
    font-family: Playfair Display, serif;
    font-size: 1.3rem; font-weight: 800; color: #1a5c38; line-height: 1.1;
  }

  .explore-btn {
    position: absolute; bottom: 12px; right: 12px;
    background: rgba(26,92,56,0.9); color: white;
    font-size: 0.75rem; font-weight: 600;
    padding: 0.35rem 0.9rem; border-radius: 20px;
    opacity: 0; transform: translateY(8px);
    transition: all 0.3s ease;
    font-family: DM Sans, sans-serif; letter-spacing: 0.03em;
    backdrop-filter: blur(4px);
  }

  .pill-btn {
    padding: 0.45rem 1.1rem; border-radius: 20px; border: 1.5px solid;
    font-size: 0.8rem; font-weight: 500; cursor: pointer;
    transition: all 0.2s ease; font-family: DM Sans, sans-serif;
  }
  .pill-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(26,92,56,0.15); }

  .results-count {
    animation: countFade 0.4s ease both;
    font-size: 0.85rem; color: #6b6b6b;
    margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;
  }
  .results-count strong { color: #1a5c38; font-size: 1rem; }

  .search-wrap {
    background: white; border: 1.5px solid #e8e0d0;
    border-radius: 12px; display: flex; align-items: center;
    overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s;
    margin-bottom: 1.5rem;
  }
  .search-wrap:focus-within { border-color: #1a5c38; box-shadow: 0 0 0 3px rgba(26,92,56,0.08); }
  .search-icon { padding: 0 1rem; font-size: 1rem; color: #6b6b6b; }
  .search-inner {
    flex: 1; padding: 0.85rem 0; border: none; outline: none;
    font-family: DM Sans, sans-serif; font-size: 0.9rem;
    background: transparent; color: #1a1a1a;
  }
  .search-inner::placeholder { color: #aaa; }
  .search-divider { width: 1px; height: 24px; background: #e8e0d0; margin: 0 0.5rem; }
  .search-select-inner {
    padding: 0.85rem 1rem; border: none; outline: none;
    font-family: DM Sans, sans-serif; font-size: 0.875rem;
    background: transparent; color: #1a1a1a; cursor: pointer; min-width: 140px;
  }

  .recurring-tag {
    display: inline-flex; align-items: center; gap: 0.25rem;
    background: #fff8e6; color: #92700c;
    font-size: 0.7rem; font-weight: 600;
    padding: 0.15rem 0.6rem; border-radius: 20px;
    border: 1px solid #f0d88a;
  }
`;

const CATEGORY_ICONS = {
  Religious: '🛕',
  Cultural: '🎭',
  Festival: '🎉',
  National: '🇱🇰',
  Music: '🎶',
  Food: '🍛',
};

function parseEventDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d;
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    API.get('/events', { params })
      .then(res => setEvents(res.data))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <>
      <style>{styles}</style>
      <Navbar />

      {/* Page Header */}
      <div className="page-header" style={{ padding: '6rem 2rem 3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.2rem', marginBottom: '0.8rem' }}>
          <img
            src="/logo.png"
            alt="SLGuide"
            className="page-logo"
            style={{
              height: '100px', width: '100px',
              objectFit: 'cover', objectPosition: 'center',
              borderRadius: '50%',
              border: '3px solid rgba(232,201,122,0.6)',
              boxShadow: '0 0 20px rgba(232,201,122,0.3), 0 4px 20px rgba(0,0,0,0.3)',
              background: 'white', padding: '4px',
            }}
          />
          <h1 className="page-title" style={{ margin: 0 }}>Events & Festivals</h1>
        </div>
        <p className="page-subtitle">
          Experience Sri Lanka's vibrant celebrations, traditions and cultural events
        </p>
      </div>

      <div className="section" style={{ paddingTop: '3rem' }}>

        {/* Search bar */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-inner"
            placeholder="Search events & festivals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="search-divider" />
          <select
            className="search-select-inner"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className="pill-btn"
              onClick={() => setCategory(c)}
              style={{
                borderColor: category === c ? '#1a5c38' : '#e8e0d0',
                background: category === c ? '#1a5c38' : 'white',
                color: category === c ? 'white' : '#6b6b6b',
              }}
            >
              {CATEGORY_ICONS[c] ? `${CATEGORY_ICONS[c]} ` : ''}{c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3>No events found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="results-count">
              <strong>{events.length}</strong>
              event{events.length !== 1 ? 's' : ''} found
              {category !== 'All' && (
                <span style={{
                  background: '#e8f5ee', color: '#1a5c38',
                  fontSize: '0.75rem', fontWeight: 600,
                  padding: '0.2rem 0.7rem', borderRadius: '20px', marginLeft: '0.3rem'
                }}>
                  {category} ✕
                </span>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {events.map((ev, i) => {
                return (
                  <div
                    className="event-card"
                    key={ev._id}
                    onClick={() => navigate(`/events/${ev._id}`)}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="card-img-wrap">
                      {ev.photos?.[0] ? (
                        <img src={getImageUrl(ev.photos[0])} alt={ev.name} className="card-img-inner" />
                      ) : (
                        <div className="card-img-placeholder">{CATEGORY_ICONS[ev.category] || '🎉'}</div>
                      )}

                      <div className="explore-btn">View Details →</div>
                    </div>

                    <div style={{ padding: '1.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                        {ev.featured && (
                          <div className="featured-banner" style={{ margin: 0 }}>⭐ Featured</div>
                        )}
                        <span className="card-tag" style={{ margin: 0 }}>
                          {CATEGORY_ICONS[ev.category] || ''} {ev.category}
                        </span>
                        {ev.isRecurringAnnual && (
                          <span className="recurring-tag">🔁 Annual</span>
                        )}
                      </div>
                      <div style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '1.2rem', fontWeight: 700,
                        color: '#1a1a1a', marginBottom: '0.5rem'
                      }}>{ev.name}</div>
                      <div style={{
                        fontSize: '0.85rem', color: '#6b6b6b',
                        display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.7rem'
                      }}>📍 {ev.district}</div>
                      <p style={{
                        fontSize: '0.875rem', color: '#6b6b6b',
                        lineHeight: 1.6, marginBottom: '0.8rem',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {ev.description.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim()}
                      </p>

                      {ev.duration && (
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          paddingTop: '0.8rem',
                          borderTop: '1px solid #f0ebe0',
                          fontSize: '0.78rem', color: '#6b6b6b'
                        }}>
                          ⏳ Duration: {ev.duration}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <footer>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', padding: '2.5rem 2rem' }}>
          <img
            src="/logo.png"
            alt="SLGuide"
            style={{
              height: '60px', width: '60px', objectFit: 'cover',
              objectPosition: 'center', borderRadius: '50%',
              border: '2px solid rgba(232,201,122,0.5)',
              boxShadow: '0 0 12px rgba(232,201,122,0.4)',
              background: 'white', padding: '3px',
            }}
          />
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
            SL<span style={{ color: '#e8c97a' }}>Guide</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: 0 }}>
            © 2024 — Discover the Pearl of the Indian Ocean 🇱🇰
          </p>
        </div>
      </footer>
    </>
  );
}