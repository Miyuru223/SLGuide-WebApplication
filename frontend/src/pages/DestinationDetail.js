import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API, { getImageUrl } from '../utils/api';

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes metaPop {
    from { opacity: 0; transform: translateY(16px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes mapPulse {
    0%,100% { box-shadow: 0 4px 16px rgba(26,92,56,0.25); }
    50%      { box-shadow: 0 6px 24px rgba(26,92,56,0.45); }
  }
  @keyframes weatherFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes tempPop {
    0%   { transform: scale(0.5); opacity: 0; }
    70%  { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes bounce {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-3px); }
  }

  .detail-hero-img {
    width: 100%; height: 100%;
    object-fit: cover;
    animation: scaleIn 0.8s ease both;
    transition: transform 0.6s ease;
  }
  .detail-hero-img:hover { transform: scale(1.03); }

  .detail-hero-wrap {
    width: 100%; height: 500px;
    overflow: hidden; position: relative;
    background: #1a3a2a;
  }

  .hero-caption {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 2rem;
    background: linear-gradient(to top, rgba(5,20,10,0.85), transparent);
    animation: fadeIn 1s ease 0.5s both;
  }
  .hero-caption h2 {
    font-family: Playfair Display, serif;
    font-size: clamp(1.6rem, 3vw, 2.5rem);
    color: white; font-weight: 800;
    margin: 0 0 0.3rem;
    text-shadow: 0 2px 12px rgba(0,0,0,0.4);
  }
  .hero-caption p { color: rgba(255,255,255,0.75); font-size: 0.9rem; margin: 0; }

  .thumb-strip {
    background: #0d0d0d; padding: 0.6rem;
    display: flex; gap: 0.4rem; overflow-x: auto;
    scrollbar-width: thin; scrollbar-color: #c9a84c #1a1a1a;
  }
  .thumb-strip::-webkit-scrollbar { height: 4px; }
  .thumb-strip::-webkit-scrollbar-track { background: #1a1a1a; }
  .thumb-strip::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 2px; }

  .thumb-img {
    width: 90px; height: 65px; object-fit: cover;
    border-radius: 6px; cursor: pointer; flex-shrink: 0;
    transition: all 0.2s ease; border: 2px solid transparent;
  }
  .thumb-img:hover { opacity: 0.9; transform: translateY(-2px); }
  .thumb-img.active { border-color: #c9a84c; opacity: 1; }
  .thumb-img.inactive { opacity: 0.45; }

  .breadcrumb-wrap { animation: slideLeft 0.6s ease 0.1s both; }

  .detail-badge {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: #e8f5ee; color: #1a5c38;
    font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 0.3rem 0.9rem; border-radius: 20px;
    margin-bottom: 0.8rem;
    animation: slideLeft 0.6s ease 0.2s both;
  }

  .detail-main-title {
    font-family: Playfair Display, serif;
    font-size: clamp(1.8rem, 4vw, 3rem);
    color: #0f3d24; font-weight: 800;
    margin-bottom: 0.5rem; letter-spacing: -0.5px; line-height: 1.15;
    animation: slideUp 0.7s ease 0.3s both;
  }

  .detail-location {
    font-size: 1rem; color: #6b6b6b;
    display: flex; align-items: center; gap: 0.4rem;
    margin-bottom: 1.5rem;
    animation: slideUp 0.7s ease 0.4s both;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem; margin: 1.5rem 0 2rem;
  }
  .meta-card {
    background: white; border: 1px solid #e8e0d0;
    border-radius: 12px; padding: 1rem 1.2rem;
    opacity: 0; animation: metaPop 0.5s ease forwards;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .meta-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(26,92,56,0.1);
  }
  .meta-card:nth-child(1) { animation-delay: 0.5s; }
  .meta-card:nth-child(2) { animation-delay: 0.65s; }
  .meta-card:nth-child(3) { animation-delay: 0.8s; }
  .meta-card:nth-child(4) { animation-delay: 0.95s; }
  .meta-card:nth-child(5) { animation-delay: 1.05s; }
  .meta-card:nth-child(6) { animation-delay: 1.15s; }

  /* Map button */
  .map-btn {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: linear-gradient(135deg, #1a5c38, #2d8a58);
    color: white; padding: 0.55rem 1.1rem;
    border-radius: 8px; font-weight: 700;
    font-size: 0.82rem; text-decoration: none;
    transition: all 0.25s ease;
    animation: mapPulse 2.5s ease-in-out 1.5s infinite;
    margin-top: 0.4rem; width: fit-content; display: flex;
  }
  .map-btn:hover {
    background: linear-gradient(135deg, #0f3d24, #1a5c38);
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 8px 24px rgba(26,92,56,0.4);
    animation: none;
  }
  .map-btn-icon { font-size: 1rem; animation: bounce 1.5s ease-in-out 2s infinite; }
  .meta-card-map {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #f0f8f3, #e8f5ee);
    border: 1.5px solid #c8e6d4;
  }

  /* ── WEATHER CARD ── */
  .meta-card-weather {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #e8f4fd, #ddeefa);
    border: 1.5px solid #b3d4f0;
    animation: weatherFadeIn 0.7s ease 1.3s both !important;
    opacity: 0;
  }
  .weather-inner {
    display: flex; align-items: center;
    justify-content: space-between; flex-wrap: wrap; gap: 1rem;
  }
  .weather-left {
    display: flex; align-items: center; gap: 0.8rem;
  }
  .weather-icon {
    font-size: 3.2rem;
    line-height: 1;
    animation: tempPop 0.7s cubic-bezier(0.34,1.56,0.64,1) 1.5s both;
    filter: drop-shadow(0 2px 8px rgba(0,100,200,0.2));
  }
  .weather-temp {
    font-family: Playfair Display, serif;
    font-size: 2.4rem; font-weight: 800;
    color: #1a5c38; line-height: 1;
    animation: tempPop 0.7s cubic-bezier(0.34,1.56,0.64,1) 1.6s both;
  }
  .weather-temp sup { font-size: 1rem; font-weight: 400; color: #6b6b6b; }
  .weather-desc {
    font-size: 0.85rem; color: #444; font-weight: 600;
    text-transform: capitalize; margin-top: 0.2rem;
  }
  .weather-label {
    font-size: 0.68rem; text-transform: uppercase;
    letter-spacing: 0.1em; color: #5a8fc0; font-weight: 700;
    margin-bottom: 0.3rem;
  }
  .weather-stats {
    display: flex; gap: 1.2rem; flex-wrap: wrap;
  }
  .weather-stat {
    display: flex; flex-direction: column; align-items: center;
    background: rgba(255,255,255,0.6); border-radius: 10px;
    padding: 0.5rem 0.9rem; backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.8);
    min-width: 70px;
  }
  .weather-stat-value {
    font-size: 1rem; font-weight: 700; color: #1a5c38;
    font-family: Playfair Display, serif;
  }
  .weather-stat-label {
    font-size: 0.65rem; color: #6b6b6b;
    text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.1rem;
  }
  .weather-loader {
    display: flex; align-items: center; gap: 0.6rem; color: #5a8fc0; font-size: 0.85rem;
  }
  .weather-spin {
    width: 18px; height: 18px;
    border: 2px solid #b3d4f0; border-top-color: #1a5c38;
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  .weather-err {
    font-size: 0.82rem; color: #999;
    display: flex; align-items: center; gap: 0.4rem;
  }
  .weather-updated {
    font-size: 0.7rem; color: #aaa; margin-top: 0.3rem;
  }

  .section-block {
    margin-bottom: 2.5rem;
    animation: slideUp 0.7s ease both;
  }
  .section-block:nth-of-type(1) { animation-delay: 0.6s; }
  .section-block:nth-of-type(2) { animation-delay: 0.75s; }

  .section-block h3 {
    font-family: Playfair Display, serif;
    font-size: 1.25rem; color: #0f3d24; font-weight: 700;
    margin-bottom: 0.8rem; padding-bottom: 0.5rem;
    border-bottom: 2px solid #e8f5ee;
    display: flex; align-items: center; gap: 0.5rem;
  }

  .rich-text { color: #555; line-height: 1.85; font-size: 0.95rem; }
  .rich-text p { margin-bottom: 0.8rem; }
  .rich-text b, .rich-text strong { font-weight: 700; color: #1a1a1a; }
  .rich-text i, .rich-text em { font-style: italic; }
  .rich-text u { text-decoration: underline; }
  .rich-text ul { padding-left: 1.4rem; margin: 0.5rem 0 0.8rem; list-style-type: disc; }
  .rich-text ol { padding-left: 1.4rem; margin: 0.5rem 0 0.8rem; list-style-type: decimal; }
  .rich-text li { margin-bottom: 0.35rem; }
  .rich-text h3 {
    font-family: Playfair Display, serif;
    font-size: 1.05rem; font-weight: 700; color: #0f3d24;
    margin: 0.8rem 0 0.3rem; border-bottom: none; padding-bottom: 0;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.6rem; margin-top: 1rem;
  }
  .gallery-img {
    width: 100%; height: 140px; object-fit: cover;
    border-radius: 10px; cursor: pointer;
    transition: all 0.3s ease; border: 2px solid transparent;
  }
  .gallery-img:hover {
    transform: scale(1.04); border-color: #c9a84c;
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }

  .back-btn {
    display: inline-flex; align-items: center; gap: 0.5rem;
    color: white; background: #1a5c38;
    padding: 0.7rem 1.5rem; border-radius: 8px;
    font-weight: 600; font-size: 0.9rem; text-decoration: none;
    transition: all 0.2s ease; margin-top: 2rem;
  }
  .back-btn:hover {
    background: #0f3d24; transform: translateX(-4px);
    box-shadow: 0 4px 16px rgba(26,92,56,0.3);
  }

  .featured-pill {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: linear-gradient(135deg, #fff8e6, #fef3cc);
    border: 1px solid #f0d88a; color: #92700c;
    font-size: 0.78rem; font-weight: 600;
    padding: 0.3rem 0.8rem; border-radius: 20px;
    margin-bottom: 0.8rem;
    animation: slideLeft 0.6s ease 0.15s both;
  }
`;

// Map weather condition codes to emojis
function getWeatherEmoji(code) {
  if (code >= 200 && code < 300) return '⛈️';
  if (code >= 300 && code < 400) return '🌦️';
  if (code >= 500 && code < 600) return '🌧️';
  if (code >= 600 && code < 700) return '❄️';
  if (code >= 700 && code < 800) return '🌫️';
  if (code === 800) return '☀️';
  if (code === 801) return '🌤️';
  if (code === 802) return '⛅';
  if (code >= 803) return '☁️';
  return '🌡️';
}

// Weather background color based on condition
function getWeatherBg(code) {
  if (code === 800) return 'linear-gradient(135deg, #fff9e6, #ffe8a0)'; // sunny
  if (code >= 801 && code <= 802) return 'linear-gradient(135deg, #e8f4fd, #ddeefa)'; // partly cloudy
  if (code >= 500 && code < 600) return 'linear-gradient(135deg, #e8eeff, #d8e8f8)'; // rainy
  if (code >= 200 && code < 300) return 'linear-gradient(135deg, #ede8ff, #d8d0f0)'; // thunder
  return 'linear-gradient(135deg, #e8f4fd, #ddeefa)';
}

function WeatherWidget({ district }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!district) return;
    setLoading(true);
    setError(false);
    API.get(`/weather/${encodeURIComponent(district)}`)
      .then(res => setWeather(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [district]);

  const code = weather?.weather?.[0]?.id;
  const bg = code ? getWeatherBg(code) : 'linear-gradient(135deg, #e8f4fd, #ddeefa)';
  const emoji = code ? getWeatherEmoji(code) : '🌡️';
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="meta-card meta-card-weather"
      style={{ background: bg, borderColor: '#b3d4f0' }}>
      <div className="weather-label">🌤️ Current Weather — {district} District</div>

      {loading && (
        <div className="weather-loader">
          <div className="weather-spin" />
          Fetching live weather...
        </div>
      )}

      {error && !loading && (
        <div className="weather-err">
          ⚠️ Weather data unavailable for this district
        </div>
      )}

      {weather && !loading && (
        <div className="weather-inner">
          {/* Left — icon + temp + desc */}
          <div className="weather-left">
            <div className="weather-icon">{emoji}</div>
            <div>
              <div className="weather-temp">
                {Math.round(weather.main?.temp)}<sup>°C</sup>
              </div>
              <div className="weather-desc">
                {weather.weather?.[0]?.description}
              </div>
              <div className="weather-updated">
                Updated at {now} · {weather.isFallback ? 'Colombo area' : district}
              </div>
            </div>
          </div>

          {/* Right — stats */}
          <div className="weather-stats">
            <div className="weather-stat">
              <div className="weather-stat-value">{Math.round(weather.main?.feels_like)}°</div>
              <div className="weather-stat-label">Feels Like</div>
            </div>
            <div className="weather-stat">
              <div className="weather-stat-value">{weather.main?.humidity}%</div>
              <div className="weather-stat-label">Humidity</div>
            </div>
            <div className="weather-stat">
              <div className="weather-stat-value">{Math.round(weather.wind?.speed * 3.6)}</div>
              <div className="weather-stat-label">km/h Wind</div>
            </div>
            <div className="weather-stat">
              <div className="weather-stat-value">{Math.round(weather.main?.temp_max)}°</div>
              <div className="weather-stat-label">High</div>
            </div>
            <div className="weather-stat">
              <div className="weather-stat-value">{Math.round(weather.main?.temp_min)}°</div>
              <div className="weather-stat-label">Low</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DestinationDetail() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    API.get(`/destinations/${id}`)
      .then(res => setDestination(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <Navbar />
      <div className="loader" style={{ marginTop: '70px', minHeight: '60vh' }}>
        <div className="spinner" />
        <p style={{ color: '#6b6b6b', marginTop: '0.5rem' }}>Loading destination...</p>
      </div>
    </>
  );

  if (!destination) return (
    <>
      <Navbar />
      <div className="empty-state" style={{ marginTop: '70px', minHeight: '60vh' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
        <h3>Destination not found</h3>
        <Link to="/destinations" style={{ color: '#1a5c38', fontWeight: 600 }}>← Back to destinations</Link>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <Navbar />

      <div className="detail-page">

        {/* Hero */}
        <div className="detail-hero-wrap">
          {destination.photos?.length > 0 ? (
            <img src={getImageUrl(destination.photos[activePhoto])}
              alt={destination.name} className="detail-hero-img" />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '7rem', background: 'linear-gradient(135deg, #1a5c38, #0f3d24)'
            }}>🏛️</div>
          )}
          <div className="hero-caption">
            <h2>{destination.name}</h2>
            <p>📍 {destination.location}, {destination.district}</p>
          </div>
          {destination.photos?.length > 1 && (
            <div style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(0,0,0,0.5)', color: 'white',
              fontSize: '0.78rem', fontWeight: 600,
              padding: '0.3rem 0.8rem', borderRadius: '20px',
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)'
            }}>📷 {activePhoto + 1} / {destination.photos.length}</div>
          )}
        </div>

        {/* Thumbnail strip */}
        {destination.photos?.length > 1 && (
          <div className="thumb-strip">
            {destination.photos.map((p, i) => (
              <img key={i} src={getImageUrl(p)} alt=""
                onClick={() => setActivePhoto(i)}
                className={`thumb-img ${activePhoto === i ? 'active' : 'inactive'}`} />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="detail-content">
          <div className="breadcrumb breadcrumb-wrap">
            <Link to="/">Home</Link> /
            <Link to="/destinations">Destinations</Link> /
            <span style={{ color: '#1a1a1a' }}>{destination.name}</span>
          </div>

          {destination.featured && <div className="featured-pill">⭐ Featured Destination</div>}
          <div className="detail-badge">🏷️ {destination.category} &nbsp;·&nbsp; {destination.district}</div>

          <h1 className="detail-main-title">{destination.name}</h1>
          <div className="detail-location">📍 {destination.location}</div>

          {/* Meta cards */}
          <div className="meta-grid">
            <div className="meta-card">
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: '0.3rem' }}>Entry Fee</div>
              <div style={{ fontWeight: 700, color: '#1a5c38', fontSize: '0.95rem' }}>🎟️ {destination.entryFee || 'Free'}</div>
            </div>
            <div className="meta-card">
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: '0.3rem' }}>Opening Hours</div>
              <div style={{ fontWeight: 700, color: '#1a5c38', fontSize: '0.95rem' }}>🕐 {destination.openingHours || 'N/A'}</div>
            </div>
            {destination.bestTimeToVisit && (
              <div className="meta-card">
                <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: '0.3rem' }}>Best Time</div>
                <div style={{ fontWeight: 700, color: '#1a5c38', fontSize: '0.95rem' }}>📅 {destination.bestTimeToVisit}</div>
              </div>
            )}
            <div className="meta-card">
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: '0.3rem' }}>District</div>
              <div style={{ fontWeight: 700, color: '#1a5c38', fontSize: '0.95rem' }}>🗺️ {destination.district}</div>
            </div>

            {/* Map card */}
            {destination.mapUrl && (
              <div className="meta-card meta-card-map" style={{ animationDelay: '1.05s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1a5c38', fontWeight: 700, marginBottom: '0.3rem' }}>
                      🌍 Location
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#0f3d24', fontWeight: 600 }}>
                      {destination.location}, {destination.district}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b6b6b', marginTop: '0.2rem' }}>
                      Click to open in Google Maps
                    </div>
                  </div>
                  <a href={destination.mapUrl} target="_blank" rel="noreferrer" className="map-btn">
                    <span className="map-btn-icon">🌍</span>
                    View on Google Maps
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>↗</span>
                  </a>
                </div>
              </div>
            )}

            {/* ── WEATHER WIDGET ── */}
            <WeatherWidget district={destination.district} />
          </div>

          {/* About */}
          <div className="section-block">
            <h3>🏛️ About This Destination</h3>
            <div className="rich-text" dangerouslySetInnerHTML={{ __html: destination.description }} />
          </div>

          {/* History */}
          {destination.history && (
            <div className="section-block">
              <h3>📜 Historical Background</h3>
              <div className="rich-text" dangerouslySetInnerHTML={{ __html: destination.history }} />
            </div>
          )}

          {/* Gallery */}
          {destination.photos?.length > 1 && (
            <div className="section-block">
              <h3>📷 Photo Gallery</h3>
              <div className="gallery-grid">
                {destination.photos.map((p, i) => (
                  <img key={i} src={getImageUrl(p)} alt={`${destination.name} ${i + 1}`}
                    className="gallery-img" onClick={() => setActivePhoto(i)} />
                ))}
              </div>
            </div>
          )}

          <Link to="/destinations" className="back-btn">← Back to All Destinations</Link>
        </div>
      </div>

      <footer>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', padding: '2.5rem 2rem' }}>
          <img src="/logo.png" alt="SLGuide" style={{
            height: '60px', width: '60px', objectFit: 'cover',
            objectPosition: 'center', borderRadius: '50%',
            border: '2px solid rgba(232,201,122,0.5)',
            boxShadow: '0 0 12px rgba(232,201,122,0.4)',
            background: 'white', padding: '3px',
          }} />
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>
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