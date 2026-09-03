const express = require('express');
const router  = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

// Default settings - seeded on first run
const DEFAULTS = [
  {
    key: 'labour_rate_per_sqft',
    value: 2,
    label: 'Labour Rate (₹ per sq.ft)',
    description: 'Labour installation charge per square foot of tiles laid',
  },
  {
    key: 'transport_base_charge',
    value: 250,
    label: 'Transport Base Charge (₹)',
    description: 'Minimum transport charge for deliveries up to 5 km',
  },
  {
    key: 'transport_light_per_km',
    value: 15,
    label: 'Light Vehicle Rate (₹/km) — 100 to 800 kg',
    description: 'Per km charge beyond 5 km for small tempo/light vehicle (100–800 kg load)',
  },
  {
    key: 'transport_heavy_per_km',
    value: 22,
    label: 'Heavy Vehicle Rate (₹/km) — 800 to 3000 kg',
    description: 'Per km charge beyond 5 km for heavy truck (800–3000 kg load)',
  },
  {
    key: 'transport_heavy_sqft_threshold',
    value: 400,
    label: 'Heavy Vehicle Threshold (sq.ft)',
    description: 'Orders above this sq.ft require a heavy vehicle',
  },
  {
    key: 'tile_weight_per_sqft_kg',
    value: 2.2,
    label: 'Tile Weight per sq.ft (kg)',
    description: 'Average weight of tiles per square foot (used for vehicle selection)',
  },
  {
    key: 'shop_lat',
    value: 30.22447,
    label: 'Shop Latitude',
    description: 'Latitude of your shop (Bhucho Mandi, Bathinda) for distance calculation',
  },
  {
    key: 'shop_lng',
    value: 75.08144,
    label: 'Shop Longitude',
    description: 'Longitude of your shop (Bhucho Mandi, Bathinda) for distance calculation',
  },
  {
    key: 'email_from',
    value: '',
    label: 'Sender Email (Gmail)',
    description: 'Gmail address from which order emails are sent. e.g. shubhammaheshwari711@gmail.com',
  },
  {
    key: 'email_pass',
    value: '',
    label: 'Gmail App Password',
    description: '16-character App Password from myaccount.google.com → Security → App Passwords',
  },
  {
    key: 'email_from_name',
    value: 'Tile House',
    label: 'Sender Display Name',
    description: 'Name shown in From field of emails. e.g. Tile House Punjab',
  },
  {
    key: 'shop_phone',
    value: '+91 98765 43210',
    label: 'Shop Phone Number',
    description: 'Appears in all customer emails as your contact number',
  },
  {
    key: 'shop_address',
    value: 'Bhucho Mandi, Bathinda, Punjab',
    label: 'Shop Address',
    description: 'Appears in all customer emails as your shop address',
  },
];

// Seed defaults
async function seedSettings() {
  for (const s of DEFAULTS) {
    await Settings.findOneAndUpdate(
      { key: s.key },
      { $setOnInsert: s },
      { upsert: true, new: true }
    );
  }
}
seedSettings().catch(console.error);

// GET all settings (public — frontend needs these for charge calculation)
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.find({});
    // Return as flat key:value object
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET full settings list for admin (with labels/descriptions)
router.get('/full', auth, async (req, res) => {
  try {
    const settings = await Settings.find({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a setting (admin only)
router.put('/:key', auth, async (req, res) => {
  try {
    const setting = await Settings.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value },
      { new: true }
    );
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Test email configuration by sending a test mail to the configured address
router.post('/test-email', auth, async (req, res) => {
  try {
    const rows = await Settings.find({ key: { $in: ['email_from','email_pass','email_from_name'] } });
    const cfg = {};
    rows.forEach(r => { cfg[r.key] = r.value; });

    cfg.email_from      = cfg.email_from      || process.env.EMAIL_USER;
    cfg.email_pass      = cfg.email_pass      || process.env.EMAIL_PASS;
    cfg.email_from_name = cfg.email_from_name || process.env.EMAIL_FROM_NAME || 'Tile House';

    if (!cfg.email_from || !cfg.email_pass) {
      return res.status(400).json({ error: 'Email not configured. Set Sender Email and App Password in Settings or .env first.' });
    }
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      family: 4,
      auth: { user: cfg.email_from, pass: cfg.email_pass },
    });
    await transporter.sendMail({
      from: `"${cfg.email_from_name}" <${cfg.email_from}>`,
      to: cfg.email_from,
      subject: '✅ Tile House Email Configuration — Working!',
      html: `<p style="font-family:Arial;font-size:15px">
        Your email is configured correctly!<br/><br/>
        Order confirmation and dispatch emails will be sent from <strong>${cfg.email_from}</strong> to your customers whenever:<br/>
        <ul><li>Admin marks order as <strong>Confirmed</strong></li>
        <li>Admin marks order as <strong>Out for Delivery</strong></li></ul>
      </p>`,
    });
    res.json({ message: `✅ Test email sent to ${cfg.email_from} — check your inbox!` });
  } catch (err) {
    res.status(500).json({ error: `Email test failed: ${err.message}` });
  }
});

module.exports = router;
