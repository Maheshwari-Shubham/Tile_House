# 🏠 Tile House — Full Stack Tiles & Marble Website

A complete e-commerce website for your tiles and marble business, built with **React.js + Node.js + MongoDB**.

---

## 📁 Project Structure

```
tiles-app/
├── backend/               ← Node.js + Express API
│   ├── models/            ← MongoDB schemas (Product, Order, Offer, Admin)
│   ├── routes/            ← API routes
│   ├── middleware/        ← JWT auth middleware
│   ├── seedData.js        ← Auto-seeds sample products on first run
│   ├── server.js          ← Entry point
│   └── .env               ← Environment variables
│
└── frontend/              ← React.js app
    └── src/
        ├── components/    ← Navbar, Footer, ProductCard
        ├── context/       ← CartContext (state management)
        ├── pages/         ← All public pages
        │   ├── HomePage.js
        │   ├── ProductsPage.js
        │   ├── CartPage.js
        │   ├── CheckoutPage.js
        │   ├── OrderSuccessPage.js
        │   ├── OffersPage.js
        │   ├── ContactPage.js
        │   └── admin/
        │       ├── AdminLogin.js
        │       └── AdminDashboard.js
        └── utils/api.js   ← Axios API calls
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)
- npm

### Step 1 — Clone & Install

```bash
git clone https://github.com/yourusername/tile-house.git
cd Tile_House-main

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 2 — Configure Environment

**Backend Setup:**
```bash
cd backend
cp .env.example .env
# Edit .env with your values:
# - MongoDB URI
# - Cloudinary credentials
# - JWT secrets
# - Email settings (optional)
```

**Frontend Setup:**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local:
# REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3 — Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm start
# ✅ Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
# ✅ Opens http://localhost:3000
```

---

## 🌐 Production Deployment

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.**

Quick summary:
- **Backend**: Deploy to Vercel, Railway, or Docker
- **Frontend**: Deploy to Vercel
- **Database**: Use MongoDB Atlas (production)
- **Storage**: Cloudinary (unsigned upload preset required)

---

## 🔐 Admin Panel

**URL:** http://localhost:3000/admin/login  
**Username:** `admin`  
**Password:** `admin123`

> ⚠️ Change these credentials after first login by updating the Admin document in MongoDB.

### Admin Features:
- **Dashboard** — Overview stats, recent orders
- **Products** — Add / Edit / Delete tiles. Update prices anytime.
- **Orders** — View all customer orders, change status (pending → confirmed → delivered)
- **Offers** — Create & manage special discounts. Toggle live/off instantly.

---

## 🌐 Website Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero, featured products, categories, brands |
| Products | `/products` | Full catalogue with filters (category, finish, brand) |
| Cart | `/cart` | Cart with sq.ft calculator, labour & transport charges |
| Checkout | `/checkout` | Address form + payment method selection |
| Order Success | `/order-success` | Confirmation page |
| Special Offers | `/offers` | Active discounts from admin panel |
| Contact | `/contact` | Address, phone, showroom images, brands |
| Admin | `/admin` | Full admin dashboard |

---

## 💰 Pricing Logic

The cart automatically calculates:
- **Subtotal** = Price per sq.ft × Square feet (per item)
- **Labour Charges** = ₹8 per sq.ft (on total area)
- **Transportation** = ₹500 flat
- **Grand Total** = Subtotal + Labour + Transport

---

## 🛠️ Customization Guide

### Change business name/contact:
- Edit `frontend/src/components/Footer.js`
- Edit `frontend/src/pages/ContactPage.js`

### Change labour rate or transport charges:
- Edit `frontend/src/pages/CartPage.js` — top constants `TRANSPORT` and `LABOUR_RATE`

### Add/update products:
- Use the Admin Panel → Products tab
- Or edit `backend/seedData.js` for bulk initial data

### Change showroom images:
- In `ContactPage.js`, replace the Unsplash URLs in the `showroom-images` section with your actual photo URLs

### Change admin password:
- Login to MongoDB, find the `admins` collection, delete the document
- Update `seedData.js` with new username/password and restart server

---

## 📦 API Endpoints

### Products (Public)
- `GET /api/products` — All products (filter: ?category=floor&finish=matte&company=Somany)
- `GET /api/products/featured` — Featured products

### Products (Admin - requires JWT)
- `POST /api/products` — Create
- `PUT /api/products/:id` — Update (prices, stock, etc.)
- `DELETE /api/products/:id` — Delete

### Orders
- `POST /api/orders` — Place order (public)
- `GET /api/orders` — All orders (admin)
- `PUT /api/orders/:id` — Update status (admin)

### Offers
- `GET /api/offers/active` — Active offers (public)
- `POST /api/offers` — Create (admin)
- `PUT /api/offers/:id` — Update/toggle (admin)
- `DELETE /api/offers/:id` — Delete (admin)

### Admin Auth
- `POST /api/admin/login` — Returns JWT token

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6 |
| State Management | React Context (CartContext) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| HTTP Client | Axios |
| Fonts | Playfair Display + DM Sans |

---

## 📞 Support & Modifications

Built for Tile House, Ludhiana. For modifications:
- Product images: Update image URLs in Admin Panel
- Prices: Update in Admin Panel → Products
- Special offers: Admin Panel → Offers (toggle on/off instantly)
- Contact details: Edit `ContactPage.js`
