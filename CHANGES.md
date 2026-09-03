# Tile House — Update Guide (v3)

## What Changed in This Update

### 1. Products Page — Exact Size Grouping (per your request)
Products are now grouped by their **exact dimensions** (600×600 mm gets its own section, 600×1200 mm gets its own, etc.) instead of broad categories.

**Hierarchy on the page:**
```
🏠 Medium / Standard — Floors & General   ← collapsible group header
   📐 400×400 mm                           ← dimension sub-section
      [Product cards...]
   📐 600×600 mm                           ← dimension sub-section
      [Product cards...]
   📐 300×600 mm
      [Product cards...]
```

### 2. Product Detail Page (new)
Each product now has a full detail view. Click **"View Details"** on any card.
- Large image with smooth load animation
- Full description, exact size, finish, category, stock status
- Square feet calculator with live price total
- "Same size — Other Brands" comparison section at the bottom
- "Other finishes — same size" sidebar variants

### 3. Favicon / Tab Icon (fixed)
Browser tab now shows the Tile House tile logo (brown hexagon with gold tile grid).

---

## Files Changed — Replace These in Your Project

| File | What Changed |
|------|-------------|
| `frontend/public/index.html` | Added favicon links, better meta tags, page title |
| `frontend/public/favicon.svg` | **NEW** — SVG favicon (tab icon) |
| `frontend/public/favicon.ico` | **NEW** — ICO fallback favicon |
| `frontend/src/App.js` | Added `/product/:id` route |
| `frontend/src/components/ProductCard.js` | Added "View Details" button |
| `frontend/src/components/ProductCard.css` | Styles for two-button layout |
| `frontend/src/pages/ProductsPage.js` | Full rewrite — exact dimension grouping |
| `frontend/src/pages/ProductsPage.css` | Full rewrite — matching new layout |
| `frontend/src/pages/ProductDetailPage.js` | **NEW** — full product detail page |
| `frontend/src/pages/ProductDetailPage.css` | **NEW** — styles for detail page |
| `backend/models/Product.js` | Minor comment update |
| `backend/routes/products.js` | Added `dimensions` query filter |
| `backend/seedData.js` | **Rewritten** — 50 products with correct exact dimensions |

---

## Do You Need to Reinstall or Restart?

| Change | Action Needed |
|--------|--------------|
| Frontend `.js` / `.css` files | Just save the file — React hot-reloads automatically |
| `App.js` (new route added) | Save file — auto-reloads |
| Backend `routes/products.js` | Restart backend: `Ctrl+C` then `npm run dev` |
| `backend/models/Product.js` | Restart backend |
| `backend/seedData.js` | See "Applying Seed Data" below |

**No `npm install` needed** — no new packages were added.

---

## Applying the New Seed Data

The seed data only runs if the `products` collection is empty. Since you already have old data seeded, you need to clear it first.

### Option A — Via MongoDB Compass (GUI, easiest)
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Click `tilesdb` database → `products` collection
4. Click **"Delete all documents"** (trash icon)
5. Restart the backend — seed runs automatically

### Option B — Via Terminal
```bash
# Open MongoDB shell
mongosh

# Switch to your database
use tilesdb

# Drop just the products collection (keeps orders, offers, admin)
db.products.deleteMany({})

# Exit
exit
```
Then restart the backend with `npm run dev`.

---

## How the New Products Page Works

1. **Pick a brand** in the sidebar (Somany / Kajaria / Oasis / Local / All)
2. Products appear **grouped by exact size** — each size gets its own section
3. Click a **group header** to collapse/expand it
4. Click **"View all →"** on a dimension sub-section to see only that size
5. Use **"Jump to Size"** in sidebar to instantly filter to one dimension
6. Click **"View Details"** on any card to open the full product page

---

## How to Change Your Business Details

| What | File to Edit | What to Change |
|------|-------------|----------------|
| Business name | `components/Navbar.js`, `components/Footer.js` | Replace "Tile House" |
| Phone number | `components/Footer.js`, `pages/ContactPage.js`, `pages/ProductDetailPage.js` | Replace `+91 98765 43210` |
| Address | `components/Footer.js`, `pages/ContactPage.js` | Replace address lines |
| Product prices | Admin Panel → Products → Edit | Change `pricePerSqFt` directly |
| Special offers | Admin Panel → Offers | Add/edit/toggle live |
| Labour rate | `pages/CartPage.js` line ~10 | Change `LABOUR_RATE` constant |
| Transport charge | `pages/CartPage.js` line ~9 | Change `TRANSPORT` constant |
