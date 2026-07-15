const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/users', require('./routes/users'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tilesdb')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// Seed initial data
const seedData = require('./seedData');
mongoose.connection.once('open', () => {
  seedData();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  // Check if email is configured in Settings DB
  try {
    const Settings = require('./models/Settings');
    mongoose.connection.once('open', async () => {
      const emailSetting = await Settings.findOne({ key: 'email_from' });
      const configured = emailSetting?.value && emailSetting.value.includes('@');
      console.log(`📧 Email: ${configured ? '✅ Configured (' + emailSetting.value + ')' : '⚠️  Not configured — go to Admin → Settings → Email Settings'}`);
    });
  } catch {}
});
