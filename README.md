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

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas URI)
- npm

---

### Step 1 — Install Dependencies

```bash
# Install backend dependencies
cd tiles-app/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2 — Configure Environment

Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/tilesdb
JWT_SECRET=tiles_admin_secret_2024
PORT=5000
```

**For MongoDB Atlas (cloud)**, replace MONGODB_URI with your Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tilesdb
```

---

### Step 3 — Start the Backend

```bash
cd tiles-app/backend
npm run dev
```
✅ Server starts on **http://localhost:5000**  
✅ Sample products & admin user are auto-created on first run

---

### Step 4 — Start the Frontend

In a new terminal:
```bash
cd tiles-app/frontend
npm start
```
✅ Website opens at **http://localhost:3000**

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
