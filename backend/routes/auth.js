const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Path to credentials file
const credentialsFile = path.join(__dirname, '../config/admin-credentials.json');
const configDir = path.join(__dirname, '../config');

// Initialize credentials file if it doesn't exist
const initializeCredentials = () => {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  if (!fs.existsSync(credentialsFile)) {
    const defaultCredentials = {
      username: process.env.ADMIN_USERNAME || 'admin@slguide.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      recoveryQuestion: 'What is your favorite color?',
      recoveryAnswer: 'blue'
    };
    fs.writeFileSync(credentialsFile, JSON.stringify(defaultCredentials, null, 2));
  }
};

// Get current admin credentials
const getAdminCredentials = () => {
  initializeCredentials();
  const data = fs.readFileSync(credentialsFile, 'utf-8');
  const credentials = JSON.parse(data);
  return {
    username: credentials.username || process.env.ADMIN_USERNAME || 'admin@slguide.com',
    password: credentials.password || process.env.ADMIN_PASSWORD || 'admin123',
    recoveryQuestion: credentials.recoveryQuestion || 'What is your favorite color?',
    recoveryAnswer: credentials.recoveryAnswer || 'blue'
  };
};

// Save admin credentials
const saveAdminCredentials = (updatedCredentials) => {
  initializeCredentials();
  const current = getAdminCredentials();
  const merged = {
    ...current,
    ...updatedCredentials
  };
  fs.writeFileSync(credentialsFile, JSON.stringify(merged, null, 2));
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const credentials = getAdminCredentials();

  if (username !== credentials.username || password !== credentials.password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET || 'slguide_secret',
    { expiresIn: '24h' }
  );

  res.json({ token, username, role: 'admin' });
});

// GET /api/auth/verify
router.get('/verify', require('../middleware/auth'), (req, res) => {
  res.json({ valid: true, admin: req.admin });
});

// GET /api/auth/recovery-question?username=admin
router.get('/recovery-question', (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  const credentials = getAdminCredentials();
  if (username !== credentials.username) {
    return res.status(404).json({ message: 'Admin user not found' });
  }

  if (!credentials.recoveryQuestion) {
    return res.status(400).json({ message: 'No recovery question found. Contact your administrator.' });
  }

  return res.json({ recoveryQuestion: credentials.recoveryQuestion });
});

// POST /api/auth/verify-recovery
router.post('/verify-recovery', async (req, res) => {
  try {
    const { username, answer } = req.body;
    if (!username || !answer) {
      return res.status(400).json({ message: 'Username and answer are required' });
    }

    const credentials = getAdminCredentials();
    if (username !== credentials.username) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Case-insensitive answer comparison
    if (answer.trim().toLowerCase() !== credentials.recoveryAnswer?.toLowerCase()) {
      return res.status(401).json({ message: 'Recovery answer is incorrect' });
    }

    // Generate a temporary reset token
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
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'slguide_secret');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired reset token' });
    }

    if (decoded.purpose !== 'reset') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const credentials = getAdminCredentials();
    if (decoded.username !== credentials.username) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Update password
    saveAdminCredentials({
      username: credentials.username,
      password: newPassword,
      recoveryQuestion: credentials.recoveryQuestion,
      recoveryAnswer: credentials.recoveryAnswer
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// PUT /api/auth/profile
router.put('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { currentPassword, newPassword, recoveryQuestion, recoveryAnswer } = req.body;
    const credentials = getAdminCredentials();
    const adminUsername = req.admin.username;

    // Verify current password if updating password
    if (currentPassword && currentPassword !== credentials.password) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Validate recovery settings
    if ((recoveryQuestion && !recoveryAnswer) || (!recoveryQuestion && recoveryAnswer)) {
      return res.status(400).json({ message: 'Both recovery question and answer are required when updating recovery settings' });
    }

    // Ensure recovery question and answer are not empty if provided
    if (recoveryQuestion && !recoveryQuestion.trim()) {
      return res.status(400).json({ message: 'Recovery question cannot be empty' });
    }
    if (recoveryAnswer && !recoveryAnswer.trim()) {
      return res.status(400).json({ message: 'Recovery answer cannot be empty' });
    }

    const updatedCredentials = {
      username: adminUsername,
      password: newPassword || credentials.password,
      recoveryQuestion: recoveryQuestion ? recoveryQuestion.trim() : credentials.recoveryQuestion,
      recoveryAnswer: recoveryAnswer ? recoveryAnswer.trim() : credentials.recoveryAnswer
    };
    saveAdminCredentials(updatedCredentials);

    // Generate new token
    const token = jwt.sign(
      { username: adminUsername, role: 'admin' },
      process.env.JWT_SECRET || 'slguide_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Profile updated successfully',
      token,
      admin: { username: adminUsername, role: 'admin' }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// GET /api/auth/profile
router.get('/profile', require('../middleware/auth'), (req, res) => {
  try {
    const credentials = getAdminCredentials();
    res.json({
      username: credentials.username,
      recoveryQuestion: credentials.recoveryQuestion,
      hasRecoveryAnswer: !!credentials.recoveryAnswer
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

module.exports = router;
