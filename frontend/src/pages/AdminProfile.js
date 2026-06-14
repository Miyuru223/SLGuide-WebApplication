import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { showToast } from '../components/Toast';

const PRESET_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your primary school?",
  "What is the name of the street you grew up on?",
  "What was your childhood nickname?",
  "What is your oldest sibling's middle name?",
  "What was the make and model of your first car?",
  "Custom question..."
];

const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-18px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes bgDrift {
    0%   { transform: scale(1.06) translateX(0); }
    50%  { transform: scale(1.09) translateX(-1%); }
    100% { transform: scale(1.06) translateX(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes avatarPop {
    0%  { transform: scale(0.7); opacity: 0; }
    70% { transform: scale(1.08); }
    100%{ transform: scale(1); opacity: 1; }
  }

  .profile-hero {
    position: relative;
    overflow: hidden;
    min-height: 170px;
    display: flex;
    align-items: flex-end;
    padding: 0 2.5rem 1.8rem;
  }
  .profile-hero-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: bgDrift 16s ease-in-out infinite;
    pointer-events: none;
  }
  .profile-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(8,30,16,0.88) 0%, rgba(15,61,36,0.7) 60%, rgba(10,40,20,0.82) 100%);
  }
  .profile-hero-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 1.4rem;
  }
  .profile-avatar {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a5c38, #2d8a58);
    display: flex; align-items: center; justify-content: center;
    font-family: Playfair Display, serif;
    font-size: 2rem; font-weight: 800;
    color: white;
    border: 3px solid rgba(201,168,76,0.5);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    animation: avatarPop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
    flex-shrink: 0;
  }
  .profile-hero-text { animation: slideRight 0.6s ease 0.3s both; }
  .profile-hero-text h1 {
    font-family: Playfair Display, serif;
    font-size: 1.8rem; font-weight: 800;
    color: white; margin: 0 0 0.2rem;
    letter-spacing: -0.5px;
  }
  .profile-hero-text p { color: rgba(255,255,255,0.6); font-size: 0.82rem; margin: 0; }
  .profile-badge {
    background: rgba(201,168,76,0.15);
    border: 1px solid rgba(201,168,76,0.35);
    color: #e8c97a;
    font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 0.2rem 0.7rem; border-radius: 20px;
    margin-top: 0.4rem; display: inline-block;
  }

  .profile-section {
    background: white;
    border-radius: 16px;
    border: 1px solid #e8e8e8;
    overflow: hidden;
    margin-bottom: 1.4rem;
    opacity: 0;
    animation: fadeUp 0.6s ease forwards;
    transition: box-shadow 0.2s;
  }
  .profile-section:hover { box-shadow: 0 8px 32px rgba(26,92,56,0.08); }

  .profile-section-header {
    display: flex; align-items: center; gap: 0.8rem;
    padding: 1.2rem 1.5rem;
    border-bottom: 1px solid #f0f0f0;
    background: #fafaf8;
  }
  .profile-section-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
  }
  .profile-section-icon.green { background: linear-gradient(135deg, #e8f5ee, #d0eddc); }
  .profile-section-icon.gold  { background: linear-gradient(135deg, #fff8e6, #fef0c0); }
  .profile-section-icon.blue  { background: linear-gradient(135deg, #e8f0ff, #d0e0ff); }
  .profile-section-header h2 { font-family: Playfair Display, serif; font-size: 1rem; color: #0f3d24; margin: 0; }
  .profile-section-header p  { font-size: 0.75rem; color: #aaa; margin: 0; }
  .profile-section-body { padding: 1.5rem; }

  .pf-field { margin-bottom: 1rem; }
  .pf-label {
    display: block; font-size: 0.7rem; font-weight: 700;
    color: #888; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.4rem;
  }
  .pf-input {
    width: 100%; padding: 0.78rem 1rem;
    border: 1.5px solid #e8e0d0; border-radius: 10px;
    font-family: DM Sans, sans-serif; font-size: 0.88rem;
    outline: none; transition: border 0.2s, box-shadow 0.2s;
    background: #fafaf8; color: #1a1a1a; box-sizing: border-box;
  }
  .pf-input:focus { border-color: #1a5c38; background: white; box-shadow: 0 0 0 3px rgba(26,92,56,0.09); }
  .pf-input::placeholder { color: #bbb; }

  .pw-wrap { position: relative; }
  .pw-wrap .pf-input { padding-right: 2.8rem; }
  .pw-eye {
    position: absolute; right: 0.8rem; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    font-size: 0.95rem; color: #aaa; padding: 0; line-height: 1; transition: color 0.2s;
  }
  .pw-eye:hover { color: #1a5c38; }

  .pw-bars { display: flex; gap: 4px; margin-top: 0.4rem; }
  .pw-bar  { flex: 1; height: 4px; border-radius: 2px; transition: background 0.3s; background: #e8e0d0; }
  .match-hint { font-size: 0.7rem; margin-top: 0.3rem; }

  .pf-select {
    width: 100%; padding: 0.78rem 1rem;
    border: 1.5px solid #e8e0d0; border-radius: 10px;
    font-family: DM Sans, sans-serif; font-size: 0.88rem;
    outline: none; background: white; cursor: pointer;
    color: #1a1a1a; transition: border 0.2s; box-sizing: border-box; margin-bottom: 0.8rem;
  }
  .pf-select:focus { border-color: #1a5c38; }

  .current-q {
    background: linear-gradient(135deg, #f0f8f3, #e8f5ee);
    border: 1px solid #c8e6d4; border-radius: 10px;
    padding: 0.8rem 1rem; margin-bottom: 1rem;
    font-size: 0.85rem; color: #0f3d24; font-weight: 600;
    display: flex; align-items: flex-start; gap: 0.5rem;
  }
  .no-q {
    background: #fff8e6; border: 1px solid #f0d88a; border-radius: 10px;
    padding: 0.8rem 1rem; margin-bottom: 1rem;
    font-size: 0.82rem; color: #92700c;
    display: flex; align-items: center; gap: 0.5rem;
  }

  .pf-btn {
    background: linear-gradient(135deg, #1a5c38, #2d8a58);
    color: white; border: none; padding: 0.78rem 2rem;
    border-radius: 10px; cursor: pointer;
    font-family: DM Sans, sans-serif; font-size: 0.875rem; font-weight: 600;
    transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem;
  }
  .pf-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #0f3d24, #1a5c38);
    transform: translateY(-1px); box-shadow: 0 6px 18px rgba(26,92,56,0.3);
  }
  .pf-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .pf-btn-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
    border-radius: 50%; animation: spin 0.7s linear infinite;
  }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .info-item-label { font-size: 0.7rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.3rem; }
  .info-item-value { font-size: 0.9rem; font-weight: 600; color: #0f3d24; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem; }
  @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
`;

export default function AdminProfile() {
  // ✅ Only use admin from context — no updateProfile needed
  const { admin } = useAuth();
  const [profile, setProfile] = useState({ username: '', recoveryQuestion: '', hasRecoveryAnswer: false });
  const [loading, setLoading] = useState(true);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [selectedQ, setSelectedQ] = useState('');
  const [customQ, setCustomQ] = useState('');
  const [answer, setAnswer] = useState('');
  const [confirmAnswer, setConfirmAnswer] = useState('');
  const [savingQ, setSavingQ] = useState(false);

  // ✅ Fixed: only call /auth/profile, no recovery-question call
  useEffect(() => {
    API.get('/auth/profile')
      .then(res => {
        setProfile(res.data);
        if (res.data.recoveryQuestion) {
          const isPreset = PRESET_QUESTIONS.includes(res.data.recoveryQuestion);
          setSelectedQ(isPreset ? res.data.recoveryQuestion : 'Custom question...');
          if (!isPreset) setCustomQ(res.data.recoveryQuestion);
        }
      })
      .catch(() => {
        // silently ignore — profile will show empty defaults
      })
      .finally(() => setLoading(false));
  }, []);

  const pwStrength = !newPw ? 0 : newPw.length < 6 ? 1 : newPw.length < 9 ? 2 : newPw.length < 12 ? 3 : 4;
  const pwColors  = ['', '#e53e3e', '#f6ad55', '#48bb78', '#1a5c38'];
  const pwLabels  = ['', 'Too short', 'Weak', 'Good', 'Strong ✓'];

  const handleSavePw = async () => {
    if (!currentPw) { showToast('Enter your current password', 'error'); return; }
    if (!newPw || newPw.length < 6) { showToast('New password must be at least 6 characters', 'error'); return; }
    if (newPw !== confirmPw) { showToast('Passwords do not match', 'error'); return; }
    setSavingPw(true);
    try {
      await API.put('/auth/profile', { currentPassword: currentPw, newPassword: newPw });
      showToast('Password updated successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update password', 'error');
    } finally { setSavingPw(false); }
  };

  const handleSaveRecovery = async () => {
    const question = selectedQ === 'Custom question...' ? customQ.trim() : selectedQ;
    if (!question) { showToast('Please select or enter a security question', 'error'); return; }
    if (!answer.trim()) { showToast('Please enter an answer', 'error'); return; }
    if (answer !== confirmAnswer) { showToast('Answers do not match', 'error'); return; }
    setSavingQ(true);
    try {
      await API.put('/auth/profile', { recoveryQuestion: question, recoveryAnswer: answer.trim() });
      showToast('Security question saved!');
      setProfile(p => ({ ...p, recoveryQuestion: question, hasRecoveryAnswer: true }));
      setAnswer(''); setConfirmAnswer('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally { setSavingQ(false); }
  };

  if (loading) return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="loader" style={{ minHeight: '60vh' }}><div className="spinner" /></div>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      <style>{styles}</style>
      <AdminSidebar />
      <div className="admin-main">

        <div className="profile-hero">
          <img className="profile-hero-bg"
            src="https://images.pexels.com/photos/3290075/pexels-photo-3290075.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="" />
          <div className="profile-hero-overlay" />
          <div className="profile-hero-content">
            <div className="profile-avatar">
              {(admin?.username || profile.username)?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="profile-hero-text">
              <h1>{admin?.username || profile.username}</h1>
              <p>Manage your account settings and security preferences</p>
              <span className="profile-badge">👑 Administrator · SLGuide</span>
            </div>
          </div>
        </div>

        <div className="admin-content" style={{ padding: '2rem' }}>
          <div className="two-col">

            {/* Left column */}
            <div>
              {/* Account info */}
              <div className="profile-section" style={{ animationDelay: '0.05s' }}>
                <div className="profile-section-header">
                  <div className="profile-section-icon blue">👤</div>
                  <div>
                    <h2>Account Information</h2>
                    <p>Your current account details</p>
                  </div>
                </div>
                <div className="profile-section-body">
                  <div className="info-grid">
                    <div>
                      <div className="info-item-label">Username</div>
                      <div className="info-item-value">{admin?.username || profile.username}</div>
                    </div>
                    <div>
                      <div className="info-item-label">Role</div>
                      <div className="info-item-value">Administrator</div>
                    </div>
                    <div style={{ gridColumn: '1/-1', marginTop: '0.5rem' }}>
                      <div className="info-item-label">Recovery Status</div>
                      <div style={{ marginTop: '0.3rem' }}>
                        {profile.hasRecoveryAnswer
                          ? <span style={{ background: '#e8f5ee', color: '#1a5c38', fontSize: '0.78rem', fontWeight: 600, padding: '0.25rem 0.8rem', borderRadius: 20 }}>🔒 Recovery question set</span>
                          : <span style={{ background: '#fff8e6', color: '#92700c', fontSize: '0.78rem', fontWeight: 600, padding: '0.25rem 0.8rem', borderRadius: 20 }}>⚠️ No recovery question — set one</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change password */}
              <div className="profile-section" style={{ animationDelay: '0.12s' }}>
                <div className="profile-section-header">
                  <div className="profile-section-icon green">🔑</div>
                  <div>
                    <h2>Change Password</h2>
                    <p>Update your login password</p>
                  </div>
                </div>
                <div className="profile-section-body">
                  <div className="pf-field">
                    <label className="pf-label">Current Password</label>
                    <div className="pw-wrap">
                      <input className="pf-input" type={showCurrent ? 'text' : 'password'}
                        placeholder="Enter current password"
                        value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
                      <button type="button" className="pw-eye" onClick={() => setShowCurrent(s => !s)}>
                        {showCurrent ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">New Password</label>
                    <div className="pw-wrap">
                      <input className="pf-input" type={showNew ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        value={newPw} onChange={e => setNewPw(e.target.value)} />
                      <button type="button" className="pw-eye" onClick={() => setShowNew(s => !s)}>
                        {showNew ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {newPw && (
                      <>
                        <div className="pw-bars">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="pw-bar" style={{ background: i <= pwStrength ? pwColors[pwStrength] : '#e8e0d0' }} />
                          ))}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: pwColors[pwStrength], marginTop: '0.2rem' }}>{pwLabels[pwStrength]}</div>
                      </>
                    )}
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">Confirm New Password</label>
                    <input className="pf-input" type="password" placeholder="Repeat new password"
                      value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                    {confirmPw && (
                      <div className="match-hint" style={{ color: confirmPw === newPw ? '#1a5c38' : '#e53e3e' }}>
                        {confirmPw === newPw ? '✓ Passwords match' : '✕ Do not match'}
                      </div>
                    )}
                  </div>
                  <button className="pf-btn" onClick={handleSavePw} disabled={savingPw}>
                    {savingPw ? <><div className="pf-btn-spinner" /> Saving...</> : '🔑 Update Password'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right column — Recovery */}
            <div>
              <div className="profile-section" style={{ animationDelay: '0.2s' }}>
                <div className="profile-section-header">
                  <div className="profile-section-icon gold">🛡️</div>
                  <div>
                    <h2>Security / Recovery Question</h2>
                    <p>Used to verify identity if password is forgotten</p>
                  </div>
                </div>
                <div className="profile-section-body">
                  {profile.hasRecoveryAnswer ? (
                    <div className="current-q">
                      <span>🔒</span><span>{profile.recoveryQuestion}</span>
                    </div>
                  ) : (
                    <div className="no-q">
                      <span>⚠️</span>
                      <span>No recovery question set. Add one below to enable password recovery.</span>
                    </div>
                  )}

                  <div className="pf-field">
                    <label className="pf-label">{profile.hasRecoveryAnswer ? 'Change Question' : 'Select Question'}</label>
                    <select className="pf-select" value={selectedQ} onChange={e => setSelectedQ(e.target.value)}>
                      <option value="">-- Select a security question --</option>
                      {PRESET_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                    {selectedQ === 'Custom question...' && (
                      <input className="pf-input" value={customQ} onChange={e => setCustomQ(e.target.value)}
                        placeholder="Type your custom security question..." style={{ marginTop: '0.5rem' }} />
                    )}
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">{profile.hasRecoveryAnswer ? 'New Answer' : 'Answer'}</label>
                    <input className="pf-input" type="text" placeholder="Your answer (case-insensitive)"
                      value={answer} onChange={e => setAnswer(e.target.value)} />
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">Confirm Answer</label>
                    <input className="pf-input" type="text" placeholder="Repeat your answer"
                      value={confirmAnswer} onChange={e => setConfirmAnswer(e.target.value)} />
                    {confirmAnswer && (
                      <div className="match-hint" style={{ color: confirmAnswer === answer ? '#1a5c38' : '#e53e3e' }}>
                        {confirmAnswer === answer ? '✓ Answers match' : '✕ Do not match'}
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '1rem', lineHeight: 1.6 }}>
                    💡 Answers are case-insensitive during verification.
                  </p>
                  <button className="pf-btn" onClick={handleSaveRecovery} disabled={savingQ}>
                    {savingQ ? <><div className="pf-btn-spinner" /> Saving...</> : '🛡️ Save Security Question'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}