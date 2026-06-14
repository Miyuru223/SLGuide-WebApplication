import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const styles = `
  @keyframes cardFloat {
    from { opacity: 0; transform: translateY(32px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-8px); }
    40%      { transform: translateX(8px); }
    60%      { transform: translateX(-5px); }
    80%      { transform: translateX(5px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes logoPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.4); }
    50%     { box-shadow: 0 0 0 10px rgba(201,168,76,0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes successBounce {
    0%  { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.2); }
    100%{ transform: scale(1); opacity: 1; }
  }
  @keyframes lockPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(229,62,62,0.25); }
    50%     { box-shadow: 0 0 0 8px rgba(229,62,62,0); }
  }

  .login-bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a2e1a 0%, #1a5c38 50%, #0f3d24 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }

  .login-bg::before {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: rgba(201,168,76,0.06);
    top: -100px; right: -100px;
    pointer-events: none;
  }
  .login-bg::after {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
    bottom: -80px; left: -80px;
    pointer-events: none;
  }

  .login-card-new {
    background: white;
    border-radius: 24px;
    padding: 2.8rem 2.5rem;
    max-width: 420px;
    width: 100%;
    box-shadow: 0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05);
    animation: cardFloat 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
    position: relative;
    z-index: 1;
  }

  .login-card-new.shake {
    animation: shake 0.4s ease;
  }

  .login-logo-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
    animation: fadeUp 0.6s ease 0.2s both;
  }
  .login-logo-img {
    width: 72px; height: 72px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(201,168,76,0.5);
    background: white;
    padding: 4px;
    margin-bottom: 0.8rem;
    animation: logoPulse 2.5s ease-in-out 1s infinite;
  }
  .login-brand {
    font-family: Playfair Display, serif;
    font-size: 1.8rem;
    font-weight: 800;
    color: #1a5c38;
    letter-spacing: -0.5px;
    line-height: 1;
  }
  .login-brand span { color: #c9a84c; }
  .login-subtitle-new {
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #aaa;
    margin-top: 0.3rem;
  }

  .mode-heading {
    font-family: Playfair Display, serif;
    font-size: 1.15rem;
    color: #0f3d24;
    margin-bottom: 0.4rem;
    font-weight: 700;
  }
  .mode-sub {
    font-size: 0.82rem;
    color: #6b6b6b;
    margin-bottom: 1.2rem;
    line-height: 1.5;
  }

  .field-wrap {
    margin-bottom: 1.1rem;
    animation: fadeUp 0.5s ease both;
  }
  .field-label {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    color: #888;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.45rem;
  }
  .field-input {
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
  .field-input:focus {
    border-color: #1a5c38;
    background: white;
    box-shadow: 0 0 0 3px rgba(26,92,56,0.09);
  }
  .field-input::placeholder { color: #bbb; }
  .field-input:disabled { background: #f0f0f0; cursor: not-allowed; }

  .pw-wrap { position: relative; }
  .pw-wrap .field-input { padding-right: 2.8rem; }
  .pw-eye {
    position: absolute;
    right: 0.8rem; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer; font-size: 1rem;
    color: #aaa; padding: 0; line-height: 1;
    transition: color 0.2s;
  }
  .pw-eye:hover { color: #1a5c38; }

  .btn-cta {
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
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.3rem;
  }
  .btn-cta:hover:not(:disabled) {
    background: linear-gradient(135deg, #0f3d24, #1a5c38);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(26,92,56,0.35);
  }
  .btn-cta:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
  .btn-cta.locked {
    background: linear-gradient(135deg, #b91c1c, #dc2626);
  }
  .btn-cta.locked:disabled { opacity: 0.85; }

  .btn-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  .login-err {
    background: #fff5f5;
    border: 1px solid #fed7d7;
    color: #c53030;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-size: 0.82rem;
    margin-bottom: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: fadeUp 0.3s ease both;
  }

  .login-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .text-btn {
    background: none; border: none;
    color: #1a5c38; font-size: 0.82rem;
    font-weight: 600; cursor: pointer;
    font-family: DM Sans, sans-serif;
    padding: 0; transition: opacity 0.2s;
  }
  .text-btn:hover { opacity: 0.7; }
  .text-btn.muted { color: #999; font-weight: 400; }
  .text-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .step-dots {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-bottom: 1.5rem;
  }
  .dot {
    height: 6px; border-radius: 3px;
    transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
    background: #e8e0d0;
    width: 6px;
  }
  .dot.active { background: #1a5c38; width: 20px; }
  .dot.done { background: #c9a84c; width: 6px; }

  .question-box {
    background: linear-gradient(135deg, #f0f8f3, #e8f5ee);
    border: 1.5px solid #c8e6d4;
    border-radius: 12px;
    padding: 1rem 1.2rem;
    margin-bottom: 1.2rem;
    font-size: 0.9rem;
    color: #0f3d24;
    font-weight: 600;
    line-height: 1.5;
  }

  .pw-strength-bars {
    display: flex; gap: 4px;
    margin-top: 0.4rem; margin-bottom: 0.15rem;
  }
  .pw-bar {
    flex: 1; height: 4px; border-radius: 2px;
    transition: background 0.3s;
    background: #e8e0d0;
  }

  .success-wrap {
    text-align: center;
    animation: fadeUp 0.5s ease both;
  }
  .success-emoji {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
    animation: successBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  .divider {
    height: 1px; background: #f0ebe0;
    margin: 1.2rem 0;
  }

  .back-btn-link {
    display: inline-flex; align-items: center; gap: 0.3rem;
    background: none; border: none;
    color: #6b6b6b; font-size: 0.82rem;
    cursor: pointer; font-family: DM Sans, sans-serif;
    padding: 0; margin-bottom: 1.2rem;
    transition: color 0.2s;
  }
  .back-btn-link:hover { color: #1a5c38; }
`;

export default function AdminLogin() {
  const [mode, setMode] = useState('login'); // login | forgot | verify | reset | success
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [recoveryQuestion, setRecoveryQuestion] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const go = (m) => { setMode(m); setError(''); };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError(''); setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 401 || status === 400) {
        setError(data?.message || 'Invalid credentials. Please try again.');
      } else {
        setError(data?.message || 'Login failed. Please try again.');
      }
      triggerShake();
    } finally { setLoading(false); }
  };

  const handleForgot = async () => {
    setError(''); setLoading(true);
    try {
      const res = await API.get('/auth/recovery-question');
      setRecoveryQuestion(res.data.question);
      go('verify');
    } catch (err) {
      setError('No recovery question found. Contact your administrator.');
      triggerShake();
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (!forgotAnswer.trim()) { setError('Please enter your answer.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await API.post('/auth/verify-recovery', { answer: forgotAnswer });
      setResetToken(res.data.resetToken);
      go('reset');
    } catch {
      setError('Incorrect answer. Please try again.');
      triggerShake();
    } finally { setLoading(false); }
  };

  const handleReset = async () => {
    if (!newPw || newPw.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match.'); triggerShake(); return; }
    setError(''); setLoading(true);
    try {
      await API.post('/auth/reset-password', { resetToken, newPassword: newPw });
      go('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Please try again.');
      triggerShake();
    } finally { setLoading(false); }
  };

  const pwStrength = !newPw ? 0 : newPw.length < 6 ? 1 : newPw.length < 9 ? 2 : newPw.length < 12 ? 3 : 4;
  const pwColors = ['', '#e53e3e', '#f6ad55', '#48bb78', '#1a5c38'];
  const pwLabels = ['', 'Too short', 'Weak', 'Good', 'Strong ✓'];

  const stepOf = { verify: 0, reset: 1 };

  return (
    <>
      <style>{styles}</style>
      <div className="login-bg">
        <div className={`login-card-new ${shake ? 'shake' : ''}`}>

          {/* Logo */}
          <div className="login-logo-wrap">
            <img src="/logo.png" alt="SLGuide" className="login-logo-img" />
            <div className="login-brand">SL<span>Guide</span></div>
            <div className="login-subtitle-new">Admin Portal</div>
          </div>

          {/* Step dots for recovery flow */}
          {(mode === 'verify' || mode === 'reset') && (
            <div className="step-dots">
              {['verify', 'reset'].map((s, i) => (
                <div key={s} className={`dot ${mode === s ? 'active' : stepOf[mode] > i ? 'done' : ''}`} />
              ))}
            </div>
          )}

          {error && <div className="login-err">⚠️ {error}</div>}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="field-wrap" style={{ animationDelay: '0.1s' }}>
                <label className="field-label">Username</label>
                <input className="field-input" type="text" placeholder="Enter username"
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                  required autoFocus />
              </div>
              <div className="field-wrap" style={{ animationDelay: '0.2s' }}>
                <label className="field-label">Password</label>
                <div className="pw-wrap">
                  <input className="field-input" type={showPw ? 'text' : 'password'} placeholder="Enter password"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    required />
                  <button type="button" className="pw-eye" onClick={() => setShowPw(s => !s)}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button
                className="btn-cta"
                type="submit"
                disabled={loading}
                style={{ animationDelay: '0.3s' }}
              >
                {loading
                    ? <><div className="btn-spinner" /> Signing in...</>
                    : 'Sign In →'
                }
              </button>
              <div className="login-links" style={{ animationDelay: '0.4s' }}>
                <button type="button" className="text-btn" onClick={() => navigate('/admin/forgot-password')}>
                  🔑 Forgot password?
                </button>
                <button type="button" className="text-btn muted" onClick={() => navigate('/')}>
                  ← Back to site
                </button>
              </div>
            </form>
          )}

          {/* ── FORGOT loading ── */}
          {mode === 'forgot' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div className="btn-spinner" style={{ margin: '0 auto 1rem', width: 28, height: 28, borderColor: '#e8e0d0', borderTopColor: '#1a5c38', borderWidth: 3 }} />
              <p style={{ color: '#6b6b6b', fontSize: '0.875rem' }}>Fetching your security question...</p>
            </div>
          )}

          {/* ── VERIFY ── */}
          {mode === 'verify' && (
            <div>
              <button className="back-btn-link" onClick={() => go('login')}>← Back to login</button>
              <div className="mode-heading">Security Question</div>
              <div className="question-box">🔒 {recoveryQuestion}</div>
              <div className="field-wrap">
                <label className="field-label">Your Answer</label>
                <input className="field-input" type="text" placeholder="Enter your answer"
                  value={forgotAnswer} onChange={e => setForgotAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()} autoFocus />
              </div>
              <button className="btn-cta" onClick={handleVerify} disabled={loading}>
                {loading ? <><div className="btn-spinner" /> Verifying...</> : 'Verify Answer →'}
              </button>
            </div>
          )}

          {/* ── RESET ── */}
          {mode === 'reset' && (
            <div>
              <div className="mode-heading">Set New Password</div>
              <div className="mode-sub">Choose a strong password — minimum 6 characters.</div>
              <div className="field-wrap">
                <label className="field-label">New Password</label>
                <div className="pw-wrap">
                  <input className="field-input" type={showNew ? 'text' : 'password'} placeholder="New password"
                    value={newPw} onChange={e => setNewPw(e.target.value)} autoFocus />
                  <button type="button" className="pw-eye" onClick={() => setShowNew(s => !s)}>
                    {showNew ? '🙈' : '👁️'}
                  </button>
                </div>
                {newPw && (
                  <>
                    <div className="pw-strength-bars">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="pw-bar" style={{ background: i <= pwStrength ? pwColors[pwStrength] : '#e8e0d0' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: pwColors[pwStrength] }}>{pwLabels[pwStrength]}</div>
                  </>
                )}
              </div>
              <div className="field-wrap">
                <label className="field-label">Confirm Password</label>
                <input className="field-input" type="password" placeholder="Repeat new password"
                  value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()} />
                {confirmPw && (
                  <div style={{ fontSize: '0.72rem', marginTop: '0.3rem', color: confirmPw === newPw ? '#1a5c38' : '#e53e3e' }}>
                    {confirmPw === newPw ? '✓ Passwords match' : '✕ Do not match'}
                  </div>
                )}
              </div>
              <button className="btn-cta" onClick={handleReset} disabled={loading}>
                {loading ? <><div className="btn-spinner" /> Resetting...</> : '🔒 Reset Password →'}
              </button>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {mode === 'success' && (
            <div className="success-wrap">
              <span className="success-emoji">✅</span>
              <div className="mode-heading">Password Reset!</div>
              <p style={{ fontSize: '0.875rem', color: '#6b6b6b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <button className="btn-cta" onClick={() => { go('login'); setForgotAnswer(''); setNewPw(''); setConfirmPw(''); }}>
                Back to Login →
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}