const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  description:     { type: String, required: true },
  couponCode:        { type: String, default: '', uppercase: true, trim: true },
  privateCouponCode: { type: String, default: '', uppercase: true, trim: true },
  isPrivate:         { type: Boolean, default: false }, // if true, hidden from public offers page
  discountPercent: { type: Number, default: 0 },
  discountAmount:  { type: Number, default: 0 },
  type:            { type: String, enum: ['percent', 'flat'], default: 'percent' },
  active:          { type: Boolean, default: true },
  validUntil:      { type: Date },
  applicableOn:    { type: String, default: 'all' },
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
