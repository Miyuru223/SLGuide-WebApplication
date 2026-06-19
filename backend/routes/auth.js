const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AdminSettings = require('../models/AdminSettings');

const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_BASE_MS = 5 * 60 * 1000;   // 5 minutes
const LOCKOUT_MAX_MS = 2 * 60 * 60 * 1000; // 2 hours
const loginLockouts = new Map();

const getLockoutKey = (username, req) =>
  `${req.ip || 'unknown'}:${(username || '').trim().toLowerCase()}`;

const formatLockoutDuration = (ms) => {
  const minutes = Math.ceil(ms / 60000);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return rem > 0
      ? `${hours} hour${hours > 1 ? 's' : ''} ${rem} minute${rem > 1 ? 's' : ''}`
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
};

// ── Helpers — MongoDB-backed ──────────────────────────────────────────────────

const getAdminCredentials = async () => {
  let settings = await AdminSettings.findOne();
  if (!settings) {
    // First run: seed from env vars or defaults
    settings = await AdminSettings.create({
      username: process.env.ADMIN_USERNAME || 'admin@slguide',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      recoveryQuestion: '',
      recoveryAnswer: '',
    });
  }
  return settings;
};

const saveAdminCredentials = async (data) => {
  await AdminSettings.findOneAndUpdate(
    {},
    { $set: data },
    { upsert: true, new: true }
  );
};

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const credentials = await getAdminCredentials();
    const lockoutKey = getLockoutKey(username, req);
    const now = Date.now();
    const existingLock = loginLockouts.get(lockoutKey);

    // Still locked?
    if (existingLock && existingLock.until > now) {
      const retryInSeconds = Math.ceil((existingLock.until - now) / 1000);
      return res.status(429).json({
        message: `Too many failed attempts. Please try again in ${formatLockoutDuration(existingLock.until - now)}.`,
        retryAfterSeconds: retryInSeconds,
      });
    }

    // Lockout expired — clear it
    if (existingLock && existingLock.until <= now) {
      loginLockouts.delete(lockoutKey);
    }

    // Wrong credentials
    if (username !== credentials.username || password !== credentials.password) {
      const current = loginLockouts.get(lockoutKey) || { count: 0, until: 0 };
      current.count += 1;

      if (current.count >= MAX_LOGIN_ATTEMPTS) {
        const durationMs = Math.min(
          LOCKOUT_MAX_MS,
          LOCKOUT_BASE_MS * Math.pow(2, current.count - MAX_LOGIN_ATTEMPTS)
        );
        current.until = now + durationMs;
        loginLockouts.set(lockoutKey, current);
        return res.status(429).json({
          message: `Too many failed login attempts. Locked for ${formatLockoutDuration(durationMs)}.`,
          retryAfterSeconds: Math.ceil(durationMs / 1000),
        });
      }

      loginLockouts.set(lockoutKey, current);
      const remaining = MAX_LOGIN_ATTEMPTS - current.count;
      return res.status(401).json({
        message: `Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      });
    }

    // Success — clear lockout
    loginLockouts.delete(lockoutKey);

    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET || 'slguide_secret',
      { expiresIn: '24h' }
    );
    res.json({ token, username, role: 'admin' });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/verify
router.get('/verify', require('../middleware/auth'), (req, res) => {
  res.json({ valid: true, admin: req.admin });
});

// GET /api/auth/recovery-question?username=xxx
router.get('/recovery-question', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: 'Username is required' });

    const credentials = await getAdminCredentials();
    if (username !== credentials.username)
      return res.status(404).json({ message: 'Admin user not found' });

    if (!credentials.recoveryQuestion)
      return res.status(400).json({ message: 'No recovery question set. Contact your administrator.' });

    res.json({ recoveryQuestion: credentials.recoveryQuestion });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recovery question' });
  }
});

// POST /api/auth/verify-recovery
router.post('/verify-recovery', async (req, res) => {
  try {
    const { username, answer } = req.body;
    if (!username || !answer)
      return res.status(400).json({ message: 'Username and answer are required' });

    const credentials = await getAdminCredentials();
    if (username !== credentials.username)
      return res.status(404).json({ message: 'Admin user not found' });

    if (answer.trim().toLowerCase() !== credentials.recoveryAnswer?.toLowerCase())
      return res.status(401).json({ message: 'Recovery answer is incorrect' });

    const resetToken = jwt.sign(
      { username, purpose: 'reset' },
      process.env.JWT_SECRET || 'slguide_secret',
      { expiresIn: '15m' }
    );
    res.json({ resetToken, message: 'Answer verified' });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword)
      return res.status(400).json({ message: 'Reset token and new password are required' });

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'slguide_secret');
    } catch {
      return res.status(401).json({ message: 'Invalid or expired reset token' });
    }

    if (decoded.purpose !== 'reset')
      return res.status(401).json({ message: 'Invalid token' });

    const credentials = await getAdminCredentials();
    if (decoded.username !== credentials.username)
      return res.status(404).json({ message: 'Admin user not found' });

    await saveAdminCredentials({ password: newPassword });
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// PUT /api/auth/profile
router.put('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { currentPassword, newPassword, recoveryQuestion, recoveryAnswer } = req.body;
    const credentials = await getAdminCredentials();
    const adminUsername = req.admin.username;

    // Verify current password when changing password
    if (newPassword) {
      if (!currentPassword || currentPassword !== credentials.password)
        return res.status(401).json({ message: 'Current password is incorrect' });
      if (newPassword.length < 6)
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Build update object
    const update = {};
    if (newPassword) update.password = newPassword;
    if (recoveryQuestion) update.recoveryQuestion = recoveryQuestion.trim();
    if (recoveryAnswer) update.recoveryAnswer = recoveryAnswer.trim();

    if (Object.keys(update).length > 0) {
      await saveAdminCredentials(update);
    }

    const token = jwt.sign(
      { username: adminUsername, role: 'admin' },
      process.env.JWT_SECRET || 'slguide_secret',
      { expiresIn: '24h' }
    );
    res.json({ message: 'Profile updated successfully', token, admin: { username: adminUsername, role: 'admin' } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// GET /api/auth/profile
router.get('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const credentials = await getAdminCredentials();
    res.json({
      username: credentials.username,
      recoveryQuestion: credentials.recoveryQuestion || '',
      hasRecoveryAnswer: !!credentials.recoveryAnswer,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

module.exports = router;
