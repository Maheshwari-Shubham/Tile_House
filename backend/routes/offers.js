const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const auth = require('../middleware/auth');

// Get active PUBLIC offers only — hides isPrivate offers, strips privateCouponCode from response
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      active: true,
      isPrivate: { $ne: true },
      $or: [{ validUntil: { $gte: now } }, { validUntil: null }, { validUntil: { $exists: false } }]
    });

    // Strip privateCouponCode before sending to client
    const safeOffers = offers.map(o => ({
      _id: o._id, title: o.title, description: o.description,
      couponCode: o.couponCode, // public code only
      type: o.type, discountPercent: o.discountPercent, discountAmount: o.discountAmount,
      active: o.active, validUntil: o.validUntil,
    }));
    res.json(safeOffers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validate coupon code (public or private) — server-side check, never exposes other codes
router.post('/validate-coupon', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code required' });
    const now = new Date();
    const trimmedCode = code.trim().toUpperCase();

    const offer = await Offer.findOne({
      active: true,
      $and: [
        { $or: [{ validUntil: { $gte: now } }, { validUntil: null }, { validUntil: { $exists: false } }] },
        { $or: [{ couponCode: trimmedCode }, { privateCouponCode: trimmedCode }] }
      ]
    });

    if (!offer) return res.status(404).json({ error: 'Invalid or expired coupon code' });

    // Return only what's needed — never reveal privateCouponCode
    res.json({
      _id: offer._id,
      title: offer.title,
      description: offer.description,
      type: offer.type,
      discountPercent: offer.discountPercent,
      discountAmount: offer.discountAmount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/', auth, async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create offer
router.post('/', auth, async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json(offer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Update offer
router.put('/:id', auth, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(offer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Delete offer
router.delete('/:id', auth, async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
