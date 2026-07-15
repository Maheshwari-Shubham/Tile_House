const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Order   = require('../models/Order');

const USER_JWT_SECRET = process.env.USER_JWT_SECRET || 'tilehouse_user_secret_2024';

// ── Auth middleware for user routes ──────────────────────
function userAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Login required' });
  try {
    req.user = jwt.verify(token, USER_JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please login again.' });
  }
}

// ── Register / Create Account ─────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password)
      return res.status(400).json({ error: 'Name, phone and password are required' });

    // Phone validation — 10 digits starting with 6-9
    if (!/^[6-9][0-9]{9}$/.test(phone))
      return res.status(400).json({ error: 'Enter a valid 10-digit Indian mobile number' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ phone });
    if (existing)
      return res.status(409).json({ error: 'An account with this mobile number already exists. Please login.' });

    const user = new User({ name: name.trim(), phone: phone.trim(), email: email?.trim() || '', password });
    await user.save();

    const token = jwt.sign({ id: user._id, phone: user.phone, name: user.name }, USER_JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, phone: user.phone, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Login ────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone: phone?.trim() });
    if (!user) return res.status(401).json({ error: 'No account found with this mobile number' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign({ id: user._id, phone: user.phone, name: user.name }, USER_JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get profile ──────────────────────────────────────────
router.get('/profile', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Update profile ───────────────────────────────────────
router.put('/profile', userAuth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get my orders ────────────────────────────────────────
router.get('/orders', userAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.userAuth = userAuth;
