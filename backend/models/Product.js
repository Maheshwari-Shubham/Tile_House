const mongoose = require('mongoose');

// Canonical dimension options — each becomes its own section on the Products page
const DIMENSION_OPTIONS = [
  // Small / Wall
  '10x10 cm', '10x20 cm', '20x30 cm', '30x30 cm',
  '30x45 cm', '40x40 cm', '30x60 cm', '12x12 inches',
  // Medium / Standard floor
  '300x600 mm', '400x400 mm', '600x600 mm',
  // Large format
  '600x1200 mm', '800x1600 mm', '1000x1000 mm',
  '1200x1800 mm', '800x2400 mm',
  // Plank
  '15x90 cm', '145x600 mm', '195x1200 mm',
  '20x120 cm', '30x120 cm',
  // Outdoor
  '600x600 mm outdoor', '300x600 mm outdoor',
  '600x1200 mm outdoor',
];

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  company:     { type: String, enum: ['Somany', 'Kajaria', 'Oasis', 'Local'], required: true },
  category:    { type: String, enum: ['floor', 'wall'], required: true },
  finish:      { type: String, enum: ['matte', 'glossy'], required: true },
  dimensions:  { type: String, required: true },       // exact e.g. "600x600 mm"
  sizeGroup:   { type: String, enum: ['small', 'medium', 'large', 'plank', 'outdoor'], default: 'medium' },
  pricePerSqFt:{ type: Number, required: true },
  image:       { type: String, default: '' },
  description: { type: String, default: '' },
  inStock:     { type: Boolean, default: true },
  stockSquareFeet: { type: Number, default: null, min: 0 },
  featured:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
