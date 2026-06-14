import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API, { getImageUrl } from '../utils/api';

export default function Home() {
  const [destinations, setDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get('/destinations/featured'),
      API.get('/hotels/featured'),
      API.get('/events/featured').catch(err => {
        console.error(err);
        return { data: [] };
      })
    ]).then(([dRes, hRes, eRes]) => {
      setDestinations(dRes.data);
      setHotels(hRes.data);
      setEvents(eRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero with Video Background */}
      <section className="hero">
        <div className={`hero-gradient-bg ${videoLoaded ? 'hide' : ''}`} />
        <video
          ref={videoRef}
          className={`hero-video ${videoLoaded ? 'loaded' : ''}`}
          autoPlay muted loop playsInline
          onCanPlay={() => setVideoLoaded(true)}
        >
          <source src="https://videos.pexels.com/video-files/1448735/1448735-uhd_2560_1440_24fps.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="hero-particles">
          {[...Array(12)].map((_, i) => (
            <span key={i} className={`particle particle-${i + 1}`} />
          ))}
        </div>
        <div className="hero-content">
          <div className="hero-badge">🇱🇰 The Pearl of the Indian Ocean</div>
          <h1>Discover the <em>Wonders</em> of Sri Lanka</h1>
          <p>Explore ancient kingdoms, pristine beaches, misty mountains, and vibrant culture — all in one breathtaking island.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/destinations')}>Explore Destinations</button>
            <button className="btn-outline" onClick={() => navigate('/hotels')}>Find Hotels</button>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="scroll-mouse"><div className="scroll-wheel" /></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Stats */}
      <div style={{ background: '#1a5c38', padding: '2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          {[
            { num: '8', label: 'UNESCO World Heritage Sites' },
            { num: '26', label: 'National Parks' },
            { num: '1,600km', label: 'Coastline' },
            { num: '2,500+', label: 'Years of History' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 800, color: '#c9a84c' }}>{s.num}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Destinations */}
      <div style={{
        backgroundImage: `linear-gradient(rgba(10,40,20,0.45), rgba(10,40,20,0.45)), url("https://images.pexels.com/photos/13391116/pexels-photo-13391116.jpeg?auto=compress&cs=tinysrgb&w=1920")`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
        padding: '5rem 2rem',
      }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)',
            padding: '0.4rem 1.2rem', borderRadius: '20px', marginBottom: '1rem'
          }}>
            <span style={{ color: '#e8c97a', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>✦ Must Visit</span>
          </div>
          <h2 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem,4vw,3rem)',
            color: 'white', fontWeight: 800, letterSpacing: '-0.5px',
            textShadow: '0 2px 20px rgba(0,0,0,0.4)'
          }}>Featured Destinations</h2>
          <div style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, #c9a84c, #e8c97a)', margin: '1rem auto 0', borderRadius: '2px' }} />
        </div>

        {loading ? (
          <div className="loader"><div className="spinner" style={{ borderTopColor: '#e8c97a' }} /></div>
        ) : destinations.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
            <h3 style={{ color: 'white', fontFamily: 'Playfair Display, serif' }}>No featured destinations yet</h3>
          </div>
        ) : (
          <div style={{
            maxWidth: '1200px', margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {destinations.map((d, i) => (
              <div
                key={d._id}
                onClick={() => navigate(`/destinations/${d._id}`)}
                style={{
                  position: 'relative', borderRadius: '20px', overflow: 'hidden',
                  cursor: 'pointer', height: '380px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                  transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 30px 80px rgba(0,0,0,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)';
                }}
              >
                {/* Background photo */}
                {d.photos?.[0] ? (
                  <img src={getImageUrl(d.photos[0])} alt={d.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, #1a5c38, #0f3d24)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem'
                  }}>🏛️</div>
                )}

                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(5,20,10,0.95) 0%, rgba(5,20,10,0.3) 50%, transparent 100%)',
                }} />

                {/* Category badge */}
                <div style={{
                  position: 'absolute', top: '1rem', left: '1rem',
                  background: 'rgba(201,168,76,0.9)', color: '#0f3d24',
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '0.3rem 0.8rem',
                  borderRadius: '20px', backdropFilter: 'blur(8px)',
                }}>{d.category}</div>

                {d.featured && (
                  <div style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: 'rgba(0,0,0,0.4)', color: '#e8c97a', fontSize: '0.8rem',
                    padding: '0.3rem 0.6rem', borderRadius: '20px', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(201,168,76,0.3)'
                  }}>⭐ Featured</div>
                )}

                {/* Content */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    📍 {d.location}, {d.district}
                  </div>
                  <h3 style={{
                    fontFamily: 'Playfair Display, serif', fontSize: '1.35rem', fontWeight: 800,
                    color: 'white', marginBottom: '0.5rem',
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: 1.2
                  }}>{d.name}</h3>
                  <p style={{
                    fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '1rem',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{d.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: '#e8c97a', fontWeight: 600 }}>
                      🎟️ {d.entryFee || 'Free Entry'}
                    </span>
                    <span style={{
                      fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)',
                      background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.7rem',
                      borderRadius: '20px', backdropFilter: 'blur(4px)'
                    }}>Explore →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button onClick={() => navigate('/destinations')} style={{
            background: 'transparent', color: 'white',
            border: '1.5px solid rgba(255,255,255,0.5)',
            padding: '0.9rem 2.5rem', borderRadius: '8px',
            fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', backdropFilter: 'blur(8px)',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.borderColor = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >View All Destinations →</button>
        </div>
      </div>

      {/* Featured Events & Festivals */}
      <div style={{
        backgroundImage: `linear-gradient(rgba(40,20,10,0.55), rgba(40,20,10,0.55)), url("https://images.pexels.com/photos/36638342/pexels-photo-36638342.jpeg")`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
        padding: '5rem 2rem',
      }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)',
            padding: '0.4rem 1.2rem', borderRadius: '20px', marginBottom: '1rem'
          }}>
            <span style={{ color: '#e8c97a', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>✦ Cultural Celebrations</span>
          </div>
          <h2 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem,4vw,3rem)',
            color: 'white', fontWeight: 800, letterSpacing: '-0.5px',
            textShadow: '0 2px 20px rgba(0,0,0,0.4)'
          }}>Events & Festivals</h2>
          <div style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, #c9a84c, #e8c97a)', margin: '1rem auto 0', borderRadius: '2px' }} />
        </div>

        {loading ? (
          <div className="loader"><div className="spinner" style={{ borderTopColor: '#e8c97a' }} /></div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ color: 'white', fontFamily: 'Playfair Display, serif' }}>No featured events yet</h3>
          </div>
        ) : (
          <div style={{
            maxWidth: '1200px', margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {events.map((ev, i) => {
              return (
                <div
                  key={ev._id}
                  onClick={() => navigate(`/events/${ev._id}`)}
                  style={{
                    position: 'relative', borderRadius: '20px', overflow: 'hidden',
                    cursor: 'pointer', height: '380px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                    transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 30px 80px rgba(0,0,0,0.5)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)';
                  }}
                >
                  {/* Background photo */}
                  {ev.photos?.[0] ? (
                    <img src={getImageUrl(ev.photos[0])} alt={ev.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      background: 'linear-gradient(135deg, #6e3206, #4a2e0f)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem'
                    }}>🎉</div>
                  )}

                  {/* Gradient overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(30,15,5,0.95) 0%, rgba(30,15,5,0.3) 50%, transparent 100%)',
                  }} />

                  {/* Category badge */}
                  <div style={{
                    position: 'absolute', top: '1rem', left: '1rem',
                    background: 'rgba(201,168,76,0.9)', color: '#301505',
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', padding: '0.3rem 0.8rem',
                    borderRadius: '20px', backdropFilter: 'blur(8px)',
                  }}>{ev.category}</div>

                  {ev.isRecurringAnnual && (
                    <div style={{
                      position: 'absolute', top: '1rem', right: '1rem',
                      background: 'rgba(26,92,56,0.9)', color: 'white', fontSize: '0.75rem',
                      padding: '0.3rem 0.7rem', borderRadius: '20px', backdropFilter: 'blur(8px)',
                      fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)'
                    }}>🔁 Annual</div>
                  )}

                  {/* Content */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                      📍 {ev.district}
                    </div>
                    <h3 style={{
                      fontFamily: 'Playfair Display, serif', fontSize: '1.35rem', fontWeight: 800,
                      color: 'white', marginBottom: '0.5rem',
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: 1.2
                    }}>{ev.name}</h3>
                    <p style={{
                      fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '1rem',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>{ev.description.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim()}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: '#e8c97a', fontWeight: 600 }}>
                        {ev.duration ? `⏳ ${ev.duration}` : ''}
                      </span>
                      <span style={{
                        fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)',
                        background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.7rem',
                        borderRadius: '20px', backdropFilter: 'blur(4px)'
                      }}>View Details →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button onClick={() => navigate('/events')} style={{
            background: 'transparent', color: 'white',
            border: '1.5px solid rgba(255,255,255,0.5)',
            padding: '0.9rem 2.5rem', borderRadius: '8px',
            fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', backdropFilter: 'blur(8px)',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.borderColor = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >View All Events →</button>
        </div>
      </div>

      {/* Featured Hotels */}
      <div style={{
        backgroundImage: `linear-gradient(rgba(5,20,40,0.5), rgba(5,20,40,0.5)), url("https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1920")`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
        padding: '5rem 2rem',
      }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)',
            padding: '0.4rem 1.2rem', borderRadius: '20px', marginBottom: '1rem'
          }}>
            <span style={{ color: '#e8c97a', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>✦ Stay in Style</span>
          </div>
          <h2 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem,4vw,3rem)',
            color: 'white', fontWeight: 800, letterSpacing: '-0.5px',
            textShadow: '0 2px 20px rgba(0,0,0,0.4)'
          }}>Featured Hotels</h2>
          <div style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, #c9a84c, #e8c97a)', margin: '1rem auto 0', borderRadius: '2px' }} />
        </div>

        {loading ? (
          <div className="loader"><div className="spinner" style={{ borderTopColor: '#e8c97a' }} /></div>
        ) : hotels.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏨</div>
            <h3 style={{ color: 'white', fontFamily: 'Playfair Display, serif' }}>No featured hotels yet</h3>
          </div>
        ) : (
          <div style={{
            maxWidth: '1200px', margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {hotels.map((h, i) => (
              <div
                key={h._id}
                onClick={() => navigate(`/hotels/${h._id}`)}
                style={{
                  position: 'relative', borderRadius: '20px', overflow: 'hidden',
                  cursor: 'pointer', height: '400px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 30px 80px rgba(0,0,0,0.6)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
                }}
              >
                {/* Hotel photo */}
                {h.photos?.[0] ? (
                  <img src={getImageUrl(h.photos[0])} alt={h.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, #0f2d4a, #1a4a6e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem'
                  }}>🏨</div>
                )}

                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(5,15,35,0.97) 0%, rgba(5,15,35,0.2) 55%, transparent 100%)',
                }} />

                {/* Category badge */}
                <div style={{
                  position: 'absolute', top: '1rem', left: '1rem',
                  background: 'rgba(201,168,76,0.9)', color: '#0f2d4a',
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '0.3rem 0.8rem',
                  borderRadius: '20px', backdropFilter: 'blur(8px)',
                }}>{h.category}</div>

                {/* Star rating badge top right */}
                <div style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: 'rgba(0,0,0,0.45)', color: '#e8c97a',
                  fontSize: '0.8rem', padding: '0.3rem 0.7rem',
                  borderRadius: '20px', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  letterSpacing: '0.05em'
                }}>{'★'.repeat(h.starRating)}</div>

                {/* Content */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    📍 {h.location}, {h.district}
                  </div>
                  <h3 style={{
                    fontFamily: 'Playfair Display, serif', fontSize: '1.35rem', fontWeight: 800,
                    color: 'white', marginBottom: '0.5rem',
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: 1.2
                  }}>{h.name}</h3>
                  <p style={{
                    fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: '1rem',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{h.description}</p>

                  {/* Bottom row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)',
                      padding: '0.3rem 0.8rem', borderRadius: '20px',
                      color: '#e8c97a', fontSize: '0.78rem', fontWeight: 600
                    }}>💰 {h.priceRange}</div>
                    <span style={{
                      fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)',
                      background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.7rem',
                      borderRadius: '20px', backdropFilter: 'blur(4px)'
                    }}>View Hotel →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button onClick={() => navigate('/hotels')} style={{
            background: 'transparent', color: 'white',
            border: '1.5px solid rgba(255,255,255,0.5)',
            padding: '0.9rem 2.5rem', borderRadius: '8px',
            fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', backdropFilter: 'blur(8px)',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.borderColor = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >View All Hotels →</button>
        </div>
      </div>

      {/* Why SLGuide */}
      <div style={{
        backgroundImage: `linear-gradient(rgba(10,30,18,0.72), rgba(10,30,18,0.72)), url("https://images.pexels.com/photos/32398183/pexels-photo-32398183.jpeg")`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
        padding: '1px 0'
      }}>
        <div className="section">
          <div className="section-header">
            <div className="section-tag" style={{ color: '#e8c97a' }}>Why SLGuide</div>
            <h2 className="section-title" style={{ color: 'white' }}>Your Complete Sri Lanka Travel Guide</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🏛️', title: 'Rich Heritage', desc: 'Explore ancient cities, sacred temples, and UNESCO World Heritage Sites.' },
              { icon: '🌿', title: 'Natural Beauty', desc: 'From misty hill country to golden beaches and lush rainforests.' },
              { icon: '🏨', title: 'Best Stays', desc: 'Curated hotels from luxury resorts to charming boutique guesthouses.' },
              { icon: '🗺️', title: 'Easy Navigation', desc: 'All you need to plan the perfect Sri Lanka trip in one place.' },
            ].map(f => (
              <div key={f.title} style={{
                textAlign: 'center', padding: '2.5rem 1.5rem',
                background: 'rgba(255,255,255,0.06)', borderRadius: '16px',
                border: '1px solid rgba(201,168,76,0.25)', backdropFilter: 'blur(8px)',
                transition: 'all 0.3s ease'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', marginBottom: '0.7rem', color: '#e8c97a', fontWeight: 700 }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    
<footer>
        <p>© 2024 <span>SLGuide</span> — Discover the Pearl of the Indian Ocean 🇱🇰</p>
      </footer>

    </>
  );
}