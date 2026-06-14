import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API, { getImageUrl } from '../utils/api';

const CATEGORIES = ['All', 'Luxury', 'Boutique', 'Budget', 'Resort', 'Guesthouse', 'Heritage'];

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

  .page-logo {
    animation: logoDrop 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards,
               glowPulse 3s ease-in-out 1s infinite;
    cursor: pointer;
  }
  .page-logo:hover {
    animation: logoPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards,
               glowPulse 1.5s ease-in-out infinite;
  }
  .page-title    { animation: titleSlide 0.8s ease 0.3s both; }
  .page-subtitle { animation: subtitleFade 0.8s ease 0.6s both; }

  .hotel-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #e8e0d0;
    cursor: pointer;
    opacity: 0;
    animation: cardFadeUp 0.6s ease forwards;
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }
  .hotel-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 24px 52px rgba(26,92,56,0.15);
    border-color: transparent;
  }
  .hotel-card:hover .hotel-img-inner { transform: scale(1.06); }
  .hotel-card:hover .view-btn {
    opacity: 1;
    transform: translateY(0);
  }

  .hotel-img-wrap {
    width: 100%;
    height: 220px;
    overflow: hidden;
    background: linear-gradient(135deg, #e8f0f5, #d4e4ed);
    position: relative;
  }
  .hotel-img-inner {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
    display: block;
  }
  .hotel-img-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3.5rem;
    background: linear-gradient(135deg, #e8f0f5, #d4e4ed);
  }
  .view-btn {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: rgba(26,92,56,0.9);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.35rem 0.9rem;
    border-radius: 20px;
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.3s ease;
    font-family: DM Sans, sans-serif;
    letter-spacing: 0.03em;
    backdrop-filter: blur(4px);
  }

  .pill-btn {
    padding: 0.45rem 1.1rem;
    border-radius: 20px;
    border: 1.5px solid;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: DM Sans, sans-serif;
  }
  .pill-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(26,92,56,0.15);
  }

  .results-count {
    animation: countFade 0.4s ease both;
    font-size: 0.85rem;
    color: #6b6b6b;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .results-count strong { color: #1a5c38; font-size: 1rem; }

  .search-wrap {
    background: white;
    border: 1.5px solid #e8e0d0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
    margin-bottom: 1.5rem;
  }
  .search-wrap:focus-within {
    border-color: #1a5c38;
    box-shadow: 0 0 0 3px rgba(26,92,56,0.08);
  }
  .search-icon { padding: 0 1rem; font-size: 1rem; color: #6b6b6b; }
  .search-inner {
    flex: 1;
    padding: 0.85rem 0;
    border: none;
    outline: none;
    font-family: DM Sans, sans-serif;
    font-size: 0.9rem;
    background: transparent;
    color: #1a1a1a;
  }
  .search-inner::placeholder { color: #aaa; }
  .search-divider { width: 1px; height: 24px; background: #e8e0d0; margin: 0 0.5rem; flex-shrink: 0; }
  .search-select-inner {
    padding: 0.85rem 1rem;
    border: none;
    outline: none;
    font-family: DM Sans, sans-serif;
    font-size: 0.875rem;
    background: transparent;
    color: #1a1a1a;
    cursor: pointer;
    min-width: 130px;
  }

  .star-rating { color: #c9a84c; font-size: 0.9rem; letter-spacing: 0.05em; }
`;

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [stars, setStars] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    if (stars !== 'All') params.stars = stars;
    API.get('/hotels', { params })
      .then(res => setHotels(res.data))
      .finally(() => setLoading(false));
  }, [search, category, stars]);

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
          <h1 className="page-title" style={{ margin: 0 }}>Hotels & Accommodation</h1>
        </div>
        <p className="page-subtitle">
          From luxury resorts to charming boutique stays across Sri Lanka
        </p>
      </div>

      <div className="section" style={{ paddingTop: '3rem' }}>

        {/* Combined search bar */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-inner"
            placeholder="Search hotels..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="search-divider" />
          <select className="search-select-inner" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="search-divider" />
          <select className="search-select-inner" value={stars} onChange={e => setStars(e.target.value)}>
            <option value="All">All Stars</option>
            {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} ★</option>)}
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
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : hotels.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏨</div>
            <h3>No hotels found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="results-count">
              <strong>{hotels.length}</strong>
              hotel{hotels.length !== 1 ? 's' : ''} found
              {category !== 'All' && (
                <span style={{
                  background: '#e8f5ee', color: '#1a5c38',
                  fontSize: '0.75rem', fontWeight: 600,
                  padding: '0.2rem 0.7rem', borderRadius: '20px'
                }}>{category} ✕</span>
              )}
              {stars !== 'All' && (
                <span style={{
                  background: '#fff8e6', color: '#92700c',
                  fontSize: '0.75rem', fontWeight: 600,
                  padding: '0.2rem 0.7rem', borderRadius: '20px'
                }}>{stars} ★ ✕</span>
              )}
            </div>

            {/* Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {hotels.map((h, i) => (
                <div
                  className="hotel-card"
                  key={h._id}
                  onClick={() => navigate(`/hotels/${h._id}`)}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Image */}
                  <div className="hotel-img-wrap">
                    {h.photos?.[0] ? (
                      <img
                        src={getImageUrl(h.photos[0])}
                        alt={h.name}
                        className="hotel-img-inner"
                      />
                    ) : (
                      <div className="hotel-img-placeholder">🏨</div>
                    )}
                    <div className="view-btn">View Hotel →</div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '1.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                      {h.featured && (
                        <div className="featured-banner" style={{ margin: 0 }}>⭐ Featured</div>
                      )}
                      <span className="card-tag" style={{ margin: 0 }}>{h.category}</span>
                    </div>

                    {/* Stars */}
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span className="star-rating">{'★'.repeat(h.starRating)}{'☆'.repeat(5 - h.starRating)}</span>
                      <span style={{ color: '#6b6b6b', fontSize: '0.75rem', marginLeft: '0.4rem' }}>{h.starRating}-Star</span>
                    </div>

                    <div style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '1.2rem', fontWeight: 700,
                      color: '#1a1a1a', marginBottom: '0.5rem'
                    }}>{h.name}</div>

                    <div style={{
                      fontSize: '0.85rem', color: '#6b6b6b',
                      display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.7rem'
                    }}>📍 {h.location}, {h.district}</div>

                   <p style={{
                      fontSize: '0.875rem', color: '#6b6b6b',
                      lineHeight: 1.6, marginBottom: '0.8rem',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                  {h.description.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim()}
                </p>

                    {/* Footer row */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.8rem',
                      borderTop: '1px solid #f0ebe0'
                    }}>
                      <span style={{
                        background: '#fff8e6', color: '#92700c',
                        fontSize: '0.8rem', fontWeight: 600,
                        padding: '0.25rem 0.7rem', borderRadius: '4px',
                        border: '1px solid #f0d88a'
                      }}>💰 {h.priceRange}</span>
                      {h.contactPhone && (
                        <span style={{ fontSize: '0.78rem', color: '#6b6b6b' }}>
                          📞 {h.contactPhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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