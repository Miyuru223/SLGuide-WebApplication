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
    background: #4a2e0f;
  }

  .hero-caption {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 2rem;
    background: linear-gradient(to top, rgba(30,15,5,0.88), transparent);
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
    background: #fff0e0; color: #b8590c;
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
  .meta-card:nth-child(2) { animation-delay: 0.62s; }
  .meta-card:nth-child(3) { animation-delay: 0.74s; }
  .meta-card:nth-child(4) { animation-delay: 0.86s; }
  .meta-card:nth-child(5) { animation-delay: 0.98s; }

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

  .meta-label-txt {
    font-size: 0.68rem; text-transform: uppercase;
    letter-spacing: 0.1em; color: #999; margin-bottom: 0.3rem;
  }
  .meta-value-txt { font-weight: 700; color: #1a5c38; font-size: 0.95rem; }

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

  .recurring-pill {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: #e8f5ee; border: 1px solid #c8e6d4; color: #1a5c38;
    font-size: 0.78rem; font-weight: 600;
    padding: 0.3rem 0.8rem; border-radius: 20px;
    margin-bottom: 0.8rem; margin-left: 0.5rem;
    animation: slideLeft 0.6s ease 0.18s both;
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

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr; // fallback for free-text dates
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    API.get(`/events/${id}`)
      .then(res => setEvent(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <Navbar />
      <div className="loader" style={{ marginTop: '70px', minHeight: '60vh' }}>
        <div className="spinner" />
        <p style={{ color: '#6b6b6b', marginTop: '0.5rem' }}>Loading event...</p>
      </div>
    </>
  );

  if (!event) return (
    <>
      <Navbar />
      <div className="empty-state" style={{ marginTop: '70px', minHeight: '60vh' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h3>Event not found</h3>
        <Link to="/events" style={{ color: '#1a5c38', fontWeight: 600 }}>← Back to events</Link>
      </div>
    </>
  );

  const icon = CATEGORY_ICONS[event.category] || '🎉';

  return (
    <>
      <style>{styles}</style>
      <Navbar />

      <div className="detail-page">

        {/* Hero */}
        <div className="detail-hero-wrap">
          {event.photos?.length > 0 ? (
            <img src={getImageUrl(event.photos[activePhoto])}
              alt={event.name} className="detail-hero-img" />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '7rem', background: 'linear-gradient(135deg, #b8590c, #6e3206)'
            }}>{icon}</div>
          )}
          <div className="hero-caption">
            <h2>{event.name}</h2>
            <p>📍 {event.district}</p>
          </div>
          {event.photos?.length > 1 && (
            <div style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(0,0,0,0.5)', color: 'white',
              fontSize: '0.78rem', fontWeight: 600,
              padding: '0.3rem 0.8rem', borderRadius: '20px',
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)'
            }}>📷 {activePhoto + 1} / {event.photos.length}</div>
          )}
        </div>

        {/* Thumbnail strip */}
        {event.photos?.length > 1 && (
          <div className="thumb-strip">
            {event.photos.map((p, i) => (
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
            <Link to="/events">Events</Link> /
            <span style={{ color: '#1a1a1a' }}>{event.name}</span>
          </div>

          {event.featured && <div className="featured-pill">⭐ Featured Event</div>}
          {event.isRecurringAnnual && <div className="recurring-pill">🔁 Annual Event</div>}
          <div className="detail-badge">{icon} {event.category} &nbsp;·&nbsp; {event.district}</div>

          <h1 className="detail-main-title">{event.name}</h1>

          {/* Meta cards */}
          {event.duration && (
            <div className="meta-grid">
              <div className="meta-card">
                <div className="meta-label-txt">Duration</div>
                <div className="meta-value-txt">⏳ {event.duration}</div>
              </div>
            </div>
          )}

          {/* About */}
          <div className="section-block">
            <h3>{icon} About This Event</h3>
            <div className="rich-text" dangerouslySetInnerHTML={{ __html: event.description }} />
          </div>

          {/* Gallery */}
          {event.photos?.length > 1 && (
            <div className="section-block">
              <h3>📷 Photo Gallery</h3>
              <div className="gallery-grid">
                {event.photos.map((p, i) => (
                  <img key={i} src={getImageUrl(p)} alt={`${event.name} ${i + 1}`}
                    className="gallery-img" onClick={() => setActivePhoto(i)} />
                ))}
              </div>
            </div>
          )}

          <Link to="/events" className="back-btn">← Back to All Events</Link>
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