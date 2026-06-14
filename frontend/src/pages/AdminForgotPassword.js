import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const styles = `
  @keyframes cardFloat {
    from { opacity: 0; transform: translateY(32px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-8px); }
    40%      { transform: translateX(8px); }
    60%      { transform: translateX(-5px); }
    80%      { transform: translateX(5px); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-12px); max-height: 0; }
    to   { opacity: 1; transform: translateY(0); max-height: 400px; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes logoPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.4); }
    50%      { box-shadow: 0 0 0 10px rgba(201,168,76,0); }
  }
  @keyframes successPop {
    0%  { transform: scale(0.5); opacity: 0; }
    70% { transform: scale(1.15); }
    100%{ transform: scale(1); opacity: 1; }
  }
  @keyframes progressFill {
    from { width: 0; }
    to   { width: var(--target-w); }
  }

  .fp-bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a2e1a 0%, #1a5c38 50%, #0f3d24 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }
  .fp-bg::before {
    content: '';
    position: absolute;
    width: 450px; height: 450px;
    border-radius: 50%;
    background: rgba(201,168,76,0.05);
    top: -120px; right: -120px;
    pointer-events: none;
  }
  .fp-bg::after {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
    bottom: -80px; left: -80px;
    pointer-events: none;
  }

  .fp-card {
    background: white;
    border-radius: 24px;
    padding: 2.8rem 2.5rem;
    max-width: 430px;
    width: 100%;
    box-shadow: 0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05);
    animation: cardFloat 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
    position: relative;
    z-index: 1;
  }
  .fp-card.shake { animation: shake 0.4s ease; }

  /* Logo */
  .fp-logo-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.8rem;
    animation: fadeUp 0.6s ease 0.15s both;
  }
  .fp-logo-img {
    width: 68px; height: 68px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(201,168,76,0.5);
    background: white;
    padding: 4px;
    margin-bottom: 0.7rem;
    animation: logoPulse 2.5s ease-in-out 1s infinite;
  }
  .fp-brand {
    font-family: Playfair Display, serif;
    font-size: 1.7rem;
    font-weight: 800;
    color: #1a5c38;
    letter-spacing: -0.5px;
    line-height: 1;
  }
  .fp-brand span { color: #c9a84c; }
  .fp-subtitle {
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #aaa;
    margin-top: 0.3rem;
  }

  /* Progress steps */
  .fp-steps {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 1.8rem;
    animation: fadeUp 0.5s ease 0.25s both;
  }
  .fp-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    flex: 1;
  }
  .fp-step-circle {
    width: 32px; height: 32px;
    border-radius: 50%;
    border: 2px solid #e8e0d0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.78rem; font-weight: 700;
    color: #aaa;
    background: white;
    transition: all 0.4s ease;
    position: relative; z-index: 1;
  }
  .fp-step-circle.active {
    border-color: #1a5c38;
    background: #1a5c38;
    color: white;
    box-shadow: 0 0 0 4px rgba(26,92,56,0.12);
  }
  .fp-step-circle.done {
    border-color: #c9a84c;
    background: #c9a84c;
    color: white;
  }
  .fp-step-label {
    font-size: 0.62rem;
    color: #aaa;
    letter-spacing: 0.05em;
    text-align: center;
    transition: color 0.3s;
  }
  .fp-step-label.active { color: #1a5c38; font-weight: 600; }
  .fp-step-label.done   { color: #c9a84c; }
  .fp-step-line {
    flex: 1; height: 2px;
    background: #e8e0d0;
    margin: 0 4px;
    margin-bottom: 18px;
    transition: background 0.4s;
    border-radius: 1px;
  }
  .fp-step-line.done { background: #c9a84c; }

  /* Error / success */
  .fp-error {
    background: #fff5f5;
    border: 1px solid #fed7d7;
    color: #c53030;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-size: 0.82rem;
    margin-bottom: 1.1rem;
    display: flex; align-items: center; gap: 0.5rem;
    animation: fadeUp 0.3s ease both;
  }
  .fp-success-wrap {
    text-align: center;
    animation: fadeUp 0.5s ease both;
    padding: 1rem 0;
  }
  .fp-success-icon {
    font-size: 3.5rem;
    display: block;
    margin-bottom: 1rem;
    animation: successPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  /* Form fields */
  .fp-field { margin-bottom: 1rem; animation: fadeUp 0.5s ease both; }
  .fp-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 700;
    color: #888;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.4rem;
  }
  .fp-input {
    width: 100%;
    padding: 0.8rem 1.1rem;
    border: 1.5px solid #e8e0d0;
    border-radius: 10px;
    font-family: DM Sans, sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
    background: #fafaf8;
    color: #1a1a1a;
    box-sizing: border-box;
  }
  .fp-input:focus {
    border-color: #1a5c38;
    background: white;
    box-shadow: 0 0 0 3px rgba(26,92,56,0.09);
  }
  .fp-input::placeholder { color: #bbb; }
  .fp-input[readonly] {
    background: linear-gradient(135deg, #f0f8f3, #e8f5ee);
    border-color: #c8e6d4;
    color: #0f3d24;
    font-weight: 600;
    cursor: default;
  }

  /* Question reveal panel */
  .question-reveal {
    animation: slideDown 0.5s ease both;
    overflow: hidden;
  }
  .question-box-fp {
    background: linear-gradient(135deg, #f0f8f3, #e8f5ee);
    border: 1.5px solid #c8e6d4;
    border-radius: 12px;
    padding: 1rem 1.2rem;
    margin-bottom: 1.1rem;
    font-size: 0.9rem;
    color: #0f3d24;
    font-weight: 600;
    line-height: 1.5;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    animation: slideDown 0.5s ease both;
  }

  /* Password strength */
  .pw-wrap-fp { position: relative; }
  .pw-wrap-fp .fp-input { padding-right: 2.8rem; }
  .pw-eye-fp {
    position: absolute; right: 0.8rem; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer; font-size: 1rem;
    color: #aaa; padding: 0; line-height: 1;
    transition: color 0.2s;
  }
  .pw-eye-fp:hover { color: #1a5c38; }
  .pw-bars { display: flex; gap: 4px; margin-top: 0.4rem; margin-bottom: 0.15rem; }
  .pw-bar  { flex: 1; height: 4px; border-radius: 2px; transition: background 0.3s; background: #e8e0d0; }
  .pw-text { font-size: 0.7rem; }

  /* CTA button */
  .fp-btn {
    width: 100%;
    background: linear-gradient(135deg, #1a5c38, #2d8a58);
    color: white;
    border: none;
    padding: 0.9rem;
    border-radius: 10px;
    font-family: Playfair Display, serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.25s;
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    margin-top: 0.3rem;
    animation: fadeUp 0.5s ease both;
  }
  .fp-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #0f3d24, #1a5c38);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(26,92,56,0.35);
  }
  .fp-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  .btn-spinner-fp {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* Bottom links */
  .fp-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
    animation: fadeUp 0.5s ease 0.4s both;
  }
  .fp-link {
    background: none; border: none;
    color: #1a5c38; font-size: 0.82rem;
    font-weight: 600; cursor: pointer;
    font-family: DM Sans, sans-serif;
    padding: 0; transition: opacity 0.2s;
  }
  .fp-link:hover { opacity: 0.7; }
  .fp-link.muted { color: #999; font-weight: 400; }
`;

export default function AdminForgotPassword() {
  const [step, setStep] = useState(1); // 1=username, 2=answer+reset, 3=success
  const [username, setUsername] = useState('');
  const [recoveryQuestion, setRecoveryQuestion] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const fetchQuestion = async (e) => {
    e.preventDefault();
    if (!username.trim()) { setError('Please enter your username.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await API.get('/auth/recovery-question', { params: { username } });
      setRecoveryQuestion(res.data.recoveryQuestion || res.data.question);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load recovery question.');
      triggerShake();
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!recoveryAnswer.trim()) { setError('Please enter your answer.'); return; }
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      // verify answer first
      const vRes = await API.post('/auth/verify-recovery', { username, answer: recoveryAnswer });
      // then reset
      await API.post('/auth/reset-password', { resetToken: vRes.data.resetToken, newPassword });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect answer or reset failed.');
      triggerShake();
    } finally { setLoading(false); }
  };

  const pwStrength = !newPassword ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 9 ? 2 : newPassword.length < 12 ? 3 : 4;
  const pwColors  = ['', '#e53e3e', '#f6ad55', '#48bb78', '#1a5c38'];
  const pwLabels  = ['', 'Too short', 'Weak', 'Good', 'Strong ✓'];

  return (
    <>
      <style>{styles}</style>
      <div className="fp-bg">
        <div className={`fp-card ${shake ? 'shake' : ''}`}>

          {/* Logo */}
          <div className="fp-logo-wrap">
            <img src="/logo.png" alt="SLGuide" className="fp-logo-img" />
            <div className="fp-brand">SL<span>Guide</span></div>
            <div className="fp-subtitle">Password Recovery</div>
          </div>

          {/* Step progress */}
          <div className="fp-steps">
            <div className="fp-step">
              <div className={`fp-step-circle ${step === 1 ? 'active' : 'done'}`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <div className={`fp-step-label ${step === 1 ? 'active' : 'done'}`}>Username</div>
            </div>
            <div className={`fp-step-line ${step > 1 ? 'done' : ''}`} />
            <div className="fp-step">
              <div className={`fp-step-circle ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
                {step > 2 ? '✓' : '2'}
              </div>
              <div className={`fp-step-label ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>Verify</div>
            </div>
            <div className={`fp-step-line ${step > 2 ? 'done' : ''}`} />
            <div className="fp-step">
              <div className={`fp-step-circle ${step === 3 ? 'done' : ''}`}>
                {step === 3 ? '✓' : '3'}
              </div>
              <div className={`fp-step-label ${step === 3 ? 'done' : ''}`}>Reset</div>
            </div>
          </div>

          {error && <div className="fp-error">⚠️ {error}</div>}

          {/* Step 1 — username */}
          {step === 1 && (
            <form onSubmit={fetchQuestion}>
              <div className="fp-field" style={{ animationDelay: '0.1s' }}>
                <label className="fp-label">Username</label>
                <input className="fp-input" type="text" placeholder="Enter admin username"
                  value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
              </div>
              <button className="fp-btn" type="submit" disabled={loading} style={{ animationDelay: '0.2s' }}>
                {loading ? <><div className="btn-spinner-fp" /> Loading...</> : 'Continue →'}
              </button>
              <div className="fp-links">
                <button type="button" className="fp-link" onClick={() => navigate('/admin/login')}>← Back to Login</button>
                <button type="button" className="fp-link muted" onClick={() => navigate('/')}>Home</button>
              </div>
            </form>
          )}

          {/* Step 2 — answer + new password */}
          {step === 2 && (
            <form onSubmit={handleReset}>
              <div className="question-box-fp">
                <span>🔒</span>
                <span>{recoveryQuestion}</span>
              </div>

              <div className="fp-field" style={{ animationDelay: '0.05s' }}>
                <label className="fp-label">Your Answer</label>
                <input className="fp-input" type="text" placeholder="Enter your answer"
                  value={recoveryAnswer} onChange={e => setRecoveryAnswer(e.target.value)}
                  required autoFocus />
              </div>

              <div className="fp-field" style={{ animationDelay: '0.12s' }}>
                <label className="fp-label">New Password</label>
                <div className="pw-wrap-fp">
                  <input className="fp-input" type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  <button type="button" className="pw-eye-fp" onClick={() => setShowPw(s => !s)}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {newPassword && (
                  <>
                    <div className="pw-bars">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="pw-bar" style={{ background: i <= pwStrength ? pwColors[pwStrength] : '#e8e0d0' }} />
                      ))}
                    </div>
                    <div className="pw-text" style={{ color: pwColors[pwStrength] }}>{pwLabels[pwStrength]}</div>
                  </>
                )}
              </div>

              <button className="fp-btn" type="submit" disabled={loading} style={{ animationDelay: '0.2s' }}>
                {loading ? <><div className="btn-spinner-fp" /> Resetting...</> : '🔒 Reset Password →'}
              </button>
              <div className="fp-links">
                <button type="button" className="fp-link" onClick={() => { setStep(1); setError(''); }}>← Back</button>
                <button type="button" className="fp-link muted" onClick={() => navigate('/')}>Home</button>
              </div>
            </form>
          )}

          {/* Step 3 — success */}
          {step === 3 && (
            <div className="fp-success-wrap">
              <span className="fp-success-icon">✅</span>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700, color: '#0f3d24', marginBottom: '0.5rem' }}>
                Password Reset!
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b6b6b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Your password has been updated. You can now sign in with your new credentials.
              </p>
              <button className="fp-btn" onClick={() => navigate('/admin/login')}>
                Go to Login →
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}