const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const auth    = require('../middleware/auth');
const { sendOrderConfirmation, sendOrderConfirmed, sendDispatchNotification } = require('../utils/emailService');

// Place order — links to user account
router.post('/', async (req, res) => {
  try {
    const email = req.body.email?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required for order confirmation.' });
    }
    const order = new Order(req.body);
    // Priority 1: userId sent directly from frontend (user is logged in)
    if (req.body.userId) {
      order.userId = req.body.userId;
    } else {
      // Priority 2: look up by phone number as fallback
      try {
        const User = require('../models/User');
        const user = await User.findOne({ phone: req.body.phone?.trim() });
        if (user) order.userId = user._id;
      } catch {}
    }
    await order.save();
    sendOrderConfirmation(order).catch(() => {});
    res.status(201).json({ message: 'Order placed successfully!', orderId: order._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User: get own orders (requires user token)
router.get('/mine', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Login required' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.USER_JWT_SECRET || 'tilehouse_user_secret_2024');
    const userId = decoded.id || decoded._id;
    const phone  = decoded.phone;
    // Match by userId OR phone — handles all cases
    const query = [];
    if (userId) {
      const mongoose = require('mongoose');
      try { query.push({ userId: new mongoose.Types.ObjectId(userId) }); } catch {}
      query.push({ userId: userId }); // string match fallback
    }
    if (phone)  query.push({ phone: phone });
    const orders = await Order.find(query.length > 0 ? { $or: query } : { phone: phone })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Mine orders error:', err.message);
    res.status(401).json({ error: 'Session expired. Please login again.' });
  }
});

// Admin: get all orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: update order
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, adminTransportOverride, adminLabourOverride, adminNote, driverPhone, driverName, vehicleNumber } = req.body;
    const update = {};
    if (status                 !== undefined) update.status                 = status;
    if (adminTransportOverride !== undefined) update.adminTransportOverride = adminTransportOverride;
    if (adminLabourOverride    !== undefined) update.adminLabourOverride    = adminLabourOverride;
    if (adminNote              !== undefined) update.adminNote              = adminNote;
    if (driverPhone            !== undefined) update.driverPhone            = driverPhone;
    if (driverName             !== undefined) update.driverName             = driverName;
    if (vehicleNumber          !== undefined) update.vehicleNumber          = vehicleNumber;

    const order = await Order.findById(req.params.id);
    if (order) {
      const transport = (adminTransportOverride != null ? adminTransportOverride : null) ?? order.adminTransportOverride ?? order.transportationCharge;
      const labour    = (adminLabourOverride    != null ? adminLabourOverride    : null) ?? order.adminLabourOverride    ?? order.labourCharge;
      update.totalAmount = order.subtotal + transport + labour - (order.discount || 0);
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, update, { new: true });

    // Send email based on new status
    if (status && updated?.email && updated.email.includes('@')) {
      if (status === 'confirmed') {
        sendOrderConfirmed(updated).catch(e => console.error('Confirmed email error:', e.message));
      } else if (status === 'out_for_delivery') {
        sendDispatchNotification(updated).catch(e => console.error('Dispatch email error:', e.message));
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
