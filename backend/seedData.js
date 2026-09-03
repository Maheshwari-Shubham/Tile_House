const Product = require('./models/Product');
const Admin   = require('./models/Admin');
const Offer   = require('./models/Offer');

// Every product has:
//   dimensions  → exact canonical size string used for grouping sections
//   sizeGroup   → broad group (small/medium/large/plank/outdoor) for filtering

const sampleProducts = [

  // ════════════════════════════════
  //  SOMANY
  // ════════════════════════════════

  // 20x30 cm
  { name:'Somany Hygiene White',        company:'Somany', category:'wall',  finish:'glossy', sizeGroup:'small',   dimensions:'20x30 cm',   pricePerSqFt:38,  image:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400', description:'Classic white glossy wall tile with anti-bacterial coating. Ideal for kitchens and bathrooms.', inStock:true, featured:false },
  // 30x45 cm
  { name:'Somany Aqua Bath Blue',        company:'Somany', category:'wall',  finish:'glossy', sizeGroup:'small',   dimensions:'30x45 cm',   pricePerSqFt:44,  image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', description:'Fresh aqua-blue glossy wall tile. Perfect accent for modern bathrooms.', inStock:true, featured:false },
  // 30x60 cm
  { name:'Somany Spice Matte Beige',     company:'Somany', category:'wall',  finish:'matte',  sizeGroup:'small',   dimensions:'30x60 cm',   pricePerSqFt:46,  image:'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', description:'Warm beige matte wall tile with subtle texture for feature walls.', inStock:true, featured:false },
  // 12x12 inches
  { name:'Somany Classic Ivory 12"',    company:'Somany', category:'wall',  finish:'glossy', sizeGroup:'small',   dimensions:'12x12 inches',pricePerSqFt:42,  image:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400', description:'Traditional 12x12 glossy ivory tile — evergreen choice for bathrooms.', inStock:true, featured:false },
  // 400x400 mm
  { name:'Somany Terra Brown',           company:'Somany', category:'floor', finish:'matte',  sizeGroup:'medium',  dimensions:'400x400 mm', pricePerSqFt:55,  image:'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400', description:'Earthy terracotta-brown matte floor tile. Great for corridors and balconies.', inStock:true, featured:false },
  // 600x600 mm
  { name:'Somany Duragres Ash Grey',     company:'Somany', category:'floor', finish:'matte',  sizeGroup:'medium',  dimensions:'600x600 mm', pricePerSqFt:65,  image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', description:'Premium anti-skid floor tile with matte finish — ideal for living rooms and offices.', inStock:true, featured:true  },
  { name:'Somany Vitro Floor Ivory',     company:'Somany', category:'floor', finish:'glossy', sizeGroup:'medium',  dimensions:'600x600 mm', pricePerSqFt:72,  image:'https://images.unsplash.com/photo-1595514535215-9a5e64e1e2e4?w=400', description:'High-gloss ivory floor tile that brightens up any room.', inStock:true, featured:false },
  // 300x600 mm
  { name:'Somany Wall Panel Stone',      company:'Somany', category:'wall',  finish:'matte',  sizeGroup:'medium',  dimensions:'300x600 mm', pricePerSqFt:58,  image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', description:'Natural stone-look matte wall panel for TV backs and feature walls.', inStock:true, featured:false },
  // 600x1200 mm
  { name:'Somany Vitro White Marble',    company:'Somany', category:'floor', finish:'glossy', sizeGroup:'large',   dimensions:'600x1200 mm',pricePerSqFt:110, image:'https://images.unsplash.com/photo-1595514535215-9a5e64e1e2e4?w=400', description:'Large-format slab with premium white marble veins. Makes spaces feel expansive.', inStock:true, featured:true  },
  // 800x1600 mm
  { name:'Somany Grand Onyx Black',      company:'Somany', category:'floor', finish:'glossy', sizeGroup:'large',   dimensions:'800x1600 mm',pricePerSqFt:145, image:'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400', description:'Dramatic large-format onyx-black tile for luxury homes and showrooms.', inStock:true, featured:true  },
  // 1000x1000 mm
  { name:'Somany Mega Square Beige',     company:'Somany', category:'floor', finish:'matte',  sizeGroup:'large',   dimensions:'1000x1000 mm',pricePerSqFt:125, image:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400', description:'Large matte square tile for commercial lobbies and spacious living areas.', inStock:true, featured:false },
  // 1200x1800 mm
  { name:'Somany XL Calacatta',          company:'Somany', category:'floor', finish:'glossy', sizeGroup:'large',   dimensions:'1200x1800 mm',pricePerSqFt:195, image:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', description:'Ultra-large slab — Calacatta marble look for high-end residential projects.', inStock:true, featured:false },
  // 15x90 cm
  { name:'Somany Rustic Walnut Plank',   company:'Somany', category:'floor', finish:'matte',  sizeGroup:'plank',   dimensions:'15x90 cm',   pricePerSqFt:85,  image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', description:'Deep walnut-look plank tile for warm, cozy bedroom and living spaces.', inStock:true, featured:false },
  // 20x120 cm
  { name:'Somany Timber Oak Plank',      company:'Somany', category:'floor', finish:'matte',  sizeGroup:'plank',   dimensions:'20x120 cm',  pricePerSqFt:92,  image:'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', description:'Realistic oak wood-look plank tile. Warm, durable and easy to clean.', inStock:true, featured:true  },
  // 30x120 cm
  { name:'Somany Wide Plank Ash',        company:'Somany', category:'floor', finish:'matte',  sizeGroup:'plank',   dimensions:'30x120 cm',  pricePerSqFt:98,  image:'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400', description:'Wide-format ash wood plank for a modern Scandinavian aesthetic.', inStock:true, featured:false },
  // Outdoor 600x600
  { name:'Somany Outdoor Anti-Slip Grey',company:'Somany', category:'floor', finish:'matte',  sizeGroup:'outdoor', dimensions:'600x600 mm', pricePerSqFt:55,  image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', description:'Heavy-duty anti-slip outdoor tile rated for driveways and poolsides.', inStock:true, featured:false },
  // Outdoor 600x1200
  { name:'Somany Outdoor XL Slab 20mm', company:'Somany', category:'floor', finish:'matte',  sizeGroup:'outdoor', dimensions:'600x1200 mm',pricePerSqFt:72,  image:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400', description:'20mm thick outdoor slab for terraces, pathways and commercial exteriors.', inStock:true, featured:false },

  // ════════════════════════════════
  //  KAJARIA
  // ════════════════════════════════

  // 10x10 cm
  { name:'Kajaria Pristine White Mosaic',company:'Kajaria',category:'wall',  finish:'glossy', sizeGroup:'small',   dimensions:'10x10 cm',   pricePerSqFt:36,  image:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400', description:'Tiny classic mosaic-style glossy white tile for feature walls and kitchen splashbacks.', inStock:true, featured:false },
  // 30x45 cm
  { name:'Kajaria Silk Grey Bath',       company:'Kajaria',category:'wall',  finish:'matte',  sizeGroup:'small',   dimensions:'30x45 cm',   pricePerSqFt:50,  image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', description:'Smooth silk-grey matte bathroom wall tile. Contemporary and easy to clean.', inStock:true, featured:false },
  // 30x60 cm
  { name:'Kajaria Metro Brick White',    company:'Kajaria',category:'wall',  finish:'glossy', sizeGroup:'small',   dimensions:'30x60 cm',   pricePerSqFt:52,  image:'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=400', description:'Subway-inspired glossy white wall tile. Timeless for kitchens and bathrooms.', inStock:true, featured:false },
  // 40x40 cm
  { name:'Kajaria Azure Blue',           company:'Kajaria',category:'wall',  finish:'glossy', sizeGroup:'small',   dimensions:'40x40 cm',   pricePerSqFt:48,  image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', description:'Deep azure-blue glossy tile for bathroom accents and pool surrounds.', inStock:true, featured:false },
  // 400x400 mm
  { name:'Kajaria Sparkle Ivory',        company:'Kajaria',category:'floor', finish:'glossy', sizeGroup:'medium',  dimensions:'400x400 mm', pricePerSqFt:70,  image:'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', description:'Bright ivory glossy floor tile that reflects light beautifully.', inStock:true, featured:false },
  // 600x600 mm
  { name:'Kajaria Eternity Beige',       company:'Kajaria',category:'floor', finish:'matte',  sizeGroup:'medium',  dimensions:'600x600 mm', pricePerSqFt:85,  image:'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400', description:'Natural stone-look matte floor tile. Perfect for living rooms.', inStock:true, featured:true  },
  { name:'Kajaria Pearl White Gloss',    company:'Kajaria',category:'floor', finish:'glossy', sizeGroup:'medium',  dimensions:'600x600 mm', pricePerSqFt:90,  image:'https://images.unsplash.com/photo-1595514535215-9a5e64e1e2e4?w=400', description:'Bright pearl-white glossy 600 floor tile for contemporary homes.', inStock:true, featured:false },
  // 300x600 mm
  { name:'Kajaria Wall Harmony Stone',   company:'Kajaria',category:'wall',  finish:'matte',  sizeGroup:'medium',  dimensions:'300x600 mm', pricePerSqFt:62,  image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', description:'Stone-harmony matte wall tile with subtle veining for a natural look.', inStock:true, featured:false },
  // 600x1200 mm
  { name:'Kajaria Grand Statuario',      company:'Kajaria',category:'floor', finish:'glossy', sizeGroup:'large',   dimensions:'600x1200 mm',pricePerSqFt:135, image:'https://images.unsplash.com/photo-1595514535215-9a5e64e1e2e4?w=400', description:'Statuario marble-look large slab. Elegant for luxury residential interiors.', inStock:true, featured:true  },
  // 800x1600 mm
  { name:'Kajaria Marvel Calacatta',     company:'Kajaria',category:'floor', finish:'glossy', sizeGroup:'large',   dimensions:'800x1600 mm',pricePerSqFt:165, image:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', description:'Signature Calacatta marble with bold veins and a mirror-like finish. Pure luxury.', inStock:true, featured:true  },
  // 1000x1000 mm
  { name:'Kajaria Porcelain XL Square',  company:'Kajaria',category:'floor', finish:'matte',  sizeGroup:'large',   dimensions:'1000x1000 mm',pricePerSqFt:140, image:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400', description:'Minimal large-square matte tile for open-plan offices and hotel lobbies.', inStock:true, featured:false },
  // 800x2400 mm
  { name:'Kajaria Mega Matte Greige',    company:'Kajaria',category:'floor', finish:'matte',  sizeGroup:'large',   dimensions:'800x2400 mm',pricePerSqFt:210, image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', description:'Ultra-large format greige matte slab. Statement piece for high-end commercial spaces.', inStock:true, featured:false },
  // 145x600 mm
  { name:'Kajaria Slim Plank Pine',      company:'Kajaria',category:'floor', finish:'matte',  sizeGroup:'plank',   dimensions:'145x600 mm', pricePerSqFt:88,  image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', description:'Slim pine-look wood plank tile for bedrooms and study rooms.', inStock:true, featured:false },
  // 195x1200 mm
  { name:'Kajaria Heritage Teak Plank',  company:'Kajaria',category:'floor', finish:'matte',  sizeGroup:'plank',   dimensions:'195x1200 mm',pricePerSqFt:105, image:'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', description:'Authentic teak wood-look plank in a wide format for a grand flooring statement.', inStock:true, featured:false },
  // Outdoor 600x600
  { name:'Kajaria Outdoor Stone Beige',  company:'Kajaria',category:'floor', finish:'matte',  sizeGroup:'outdoor', dimensions:'600x600 mm', pricePerSqFt:58,  image:'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400', description:'Textured anti-skid outdoor tile. Weather-resistant for gardens and parking.', inStock:true, featured:false },
  // Outdoor 300x600
  { name:'Kajaria Outdoor Patio Plank',  company:'Kajaria',category:'floor', finish:'matte',  sizeGroup:'outdoor', dimensions:'300x600 mm', pricePerSqFt:62,  image:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400', description:'Rectangular patio plank tile for outdoor decks and garden pathways.', inStock:true, featured:false },

  // ════════════════════════════════
  //  OASIS
  // ════════════════════════════════

  // 20x30 cm
  { name:'Oasis Pearl White',            company:'Oasis', category:'wall',  finish:'glossy', sizeGroup:'small',   dimensions:'20x30 cm',   pricePerSqFt:32,  image:'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', description:'Affordable pearl-white glossy wall tile. Budget-friendly choice for kitchens.', inStock:true, featured:false },
  // 30x30 cm
  { name:'Oasis Sage Green',             company:'Oasis', category:'wall',  finish:'matte',  sizeGroup:'small',   dimensions:'30x30 cm',   pricePerSqFt:30,  image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', description:'Trendy sage-green matte tile for modern Scandinavian kitchen backsplashes.', inStock:true, featured:false },
  // 30x60 cm
  { name:'Oasis Wave Aqua',              company:'Oasis', category:'wall',  finish:'matte',  sizeGroup:'small',   dimensions:'30x60 cm',   pricePerSqFt:38,  image:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400', description:'Soft aqua-toned matte wall tile for fresh, breezy bathroom designs.', inStock:true, featured:false },
  // 400x400 mm
  { name:'Oasis Crystal Ivory',          company:'Oasis', category:'floor', finish:'glossy', sizeGroup:'medium',  dimensions:'400x400 mm', pricePerSqFt:40,  image:'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', description:'Elegant ivory glossy floor tile at a great price point.', inStock:true, featured:false },
  // 600x600 mm
  { name:'Oasis Rustic Brown',           company:'Oasis', category:'floor', finish:'matte',  sizeGroup:'medium',  dimensions:'600x600 mm', pricePerSqFt:45,  image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', description:'Earthy rustic floor tile with anti-slip surface. Great for outdoor-style interiors.', inStock:true, featured:false },
  // 300x600 mm
  { name:'Oasis Minimal White Wall',     company:'Oasis', category:'wall',  finish:'matte',  sizeGroup:'medium',  dimensions:'300x600 mm', pricePerSqFt:36,  image:'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=400', description:'Clean minimal matte white wall tile. Versatile for any modern bathroom.', inStock:true, featured:false },
  // 600x1200 mm
  { name:'Oasis Grande Grey Slab',       company:'Oasis', category:'floor', finish:'glossy', sizeGroup:'large',   dimensions:'600x1200 mm',pricePerSqFt:88,  image:'https://images.unsplash.com/photo-1595514535215-9a5e64e1e2e4?w=400', description:'Large-format grey glossy slab with subtle veining. Premium look at value pricing.', inStock:true, featured:false },
  // 800x1600 mm
  { name:'Oasis XL Cream Matte',         company:'Oasis', category:'floor', finish:'matte',  sizeGroup:'large',   dimensions:'800x1600 mm',pricePerSqFt:115, image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', description:'Extra-large cream matte slab for spacious living rooms and office receptions.', inStock:true, featured:false },
  // 145x600 mm
  { name:'Oasis Slim Wood Plank',        company:'Oasis', category:'floor', finish:'matte',  sizeGroup:'plank',   dimensions:'145x600 mm', pricePerSqFt:65,  image:'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400', description:'Slim-format wood plank tile. Budget-friendly wood-look tile for any room.', inStock:true, featured:false },
  // 20x120 cm
  { name:'Oasis Wood Plank Chestnut',    company:'Oasis', category:'floor', finish:'matte',  sizeGroup:'plank',   dimensions:'20x120 cm',  pricePerSqFt:78,  image:'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', description:'Chestnut wood-look plank tile at a competitive price. Great for bedrooms.', inStock:true, featured:false },
  // Outdoor 600x600
  { name:'Oasis Outdoor Khaki',          company:'Oasis', category:'floor', finish:'matte',  sizeGroup:'outdoor', dimensions:'600x600 mm', pricePerSqFt:42,  image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', description:'Budget-friendly khaki outdoor anti-skid tile for courtyards and balconies.', inStock:true, featured:false },

  // ════════════════════════════════
  //  LOCAL
  // ════════════════════════════════

  // 10x20 cm
  { name:'Local Classic Subway White',   company:'Local', category:'wall',  finish:'matte',  sizeGroup:'small',   dimensions:'10x20 cm',   pricePerSqFt:18,  image:'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=400', description:'Classic subway tile in matte white. Most affordable choice for kitchens and bathrooms.', inStock:true, featured:false },
  // 20x30 cm
  { name:'Local Glossy Sky Blue',        company:'Local', category:'wall',  finish:'glossy', sizeGroup:'small',   dimensions:'20x30 cm',   pricePerSqFt:20,  image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', description:'Sky-blue glossy tile for a fresh, budget-friendly bathroom makeover.', inStock:true, featured:false },
  // 30x30 cm
  { name:'Local Ivory Wall',             company:'Local', category:'wall',  finish:'glossy', sizeGroup:'small',   dimensions:'30x30 cm',   pricePerSqFt:22,  image:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400', description:'Affordable ivory glossy wall tile for standard bathroom and kitchen use.', inStock:true, featured:false },
  // 12x12 inches
  { name:'Local Grey Matte 12x12"',     company:'Local', category:'wall',  finish:'matte',  sizeGroup:'small',   dimensions:'12x12 inches',pricePerSqFt:24,  image:'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', description:'Budget matte grey 12x12 inch wall tile. Popular for utility areas and bathrooms.', inStock:true, featured:false },
  // 400x400 mm
  { name:'Local Terracotta Floor',       company:'Local', category:'floor', finish:'matte',  sizeGroup:'medium',  dimensions:'400x400 mm', pricePerSqFt:28,  image:'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400', description:'Earthy terracotta-look matte floor tile. Most economical choice for large areas.', inStock:true, featured:false },
  // 600x600 mm
  { name:'Local Sahara Beige Glossy',    company:'Local', category:'floor', finish:'glossy', sizeGroup:'medium',  dimensions:'600x600 mm', pricePerSqFt:32,  image:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400', description:'Warm beige glossy floor tile. Great value for budget home renovations.', inStock:true, featured:false },
  // 300x600 mm
  { name:'Local White Wall Panel',       company:'Local', category:'wall',  finish:'glossy', sizeGroup:'medium',  dimensions:'300x600 mm', pricePerSqFt:25,  image:'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=400', description:'Simple white glossy wall tile. Standard choice for bathrooms across Punjab.', inStock:true, featured:false },
  // 600x1200 mm
  { name:'Local Large Cream Matte',      company:'Local', category:'floor', finish:'matte',  sizeGroup:'large',   dimensions:'600x1200 mm',pricePerSqFt:55,  image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', description:'Large-format cream matte tile. Best value large slab on the market.', inStock:true, featured:false },
  // 15x90 cm
  { name:'Local Wood Plank Natural',     company:'Local', category:'floor', finish:'matte',  sizeGroup:'plank',   dimensions:'15x90 cm',   pricePerSqFt:48,  image:'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', description:'Affordable wood-look plank tile for bedrooms and drawing rooms.', inStock:true, featured:false },
  // Outdoor 600x600
  { name:'Local Outdoor Anti-Skid',      company:'Local', category:'floor', finish:'matte',  sizeGroup:'outdoor', dimensions:'600x600 mm', pricePerSqFt:28,  image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', description:'Most affordable outdoor anti-skid tile for parking areas and terraces.', inStock:true, featured:false },
  // Outdoor 300x600
  { name:'Local Outdoor Patio Grey',     company:'Local', category:'floor', finish:'matte',  sizeGroup:'outdoor', dimensions:'300x600 mm', pricePerSqFt:30,  image:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400', description:'Budget outdoor patio tile for garden paths and open-to-sky areas.', inStock:true, featured:false },
];

const sampleOffer = {
  title:'🎉 Monsoon Sale — Flat 10% Off!',
  description:'Get 10% discount on all tiles this season. Use coupon code MONSOON10 at checkout.',
  couponCode: 'MONSOON10',
  discountPercent:10, type:'percent', active:true,
  validUntil:new Date(Date.now() + 30*24*60*60*1000),
  applicableOn:'all',
};

module.exports = async function seedData() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(sampleProducts);
      console.log(`✅ ${sampleProducts.length} products seeded`);
    }
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const admin = new Admin({ username:'admin', password:'admin123' });
      await admin.save();
      console.log('✅ Admin created: admin / admin123');
    }
    const offerCount = await Offer.countDocuments();
    if (offerCount === 0) {
      await Offer.create(sampleOffer);
      console.log('✅ Sample offer seeded');
    }
  } catch(err) {
    console.error('Seed error:', err.message);
  }
};
