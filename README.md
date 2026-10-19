# 🏠 Hommiez — Student Housing & Community Platform (MERN Stack)

**Hommiez** is a hyper-local housing platform designed specifically for college students to discover verified flats and PGs near their campus with **upfront brokerage fee transparency** and zero hidden costs.

---

## 🎨 Theme & Colors (Campus Teal & Warm Coral)
Configured in `client/src/index.css` via CSS variables. Edit these variables anytime to re-theme the entire website in 5 seconds:
* **Primary (Navbar & Accents):** `#0F766E` (Deep Campus Teal)
* **Action Buttons (Unlock Contact / Filter):** `#FF5A36` (Warm Energetic Coral)
* **Background:** `#F8FAFC` (Clean Off-White)

---

## 🚀 Features & Ecosystem

1. **Flats & PGs Directory**:
   - Filter by Type (Flat / PG), Rent range, Campus distance, and Gender preferences.
   - Transparent zero/flat brokerage badges.
   - Lead unlocking for verified students.
   - 30-day automatic listing TTL expiration in MongoDB.

2. **Flatmate Finder**:
   - Post room requirement or available room.
   - Filter by budget, region, and gender.
   - Habit tags & Direct WhatsApp connect.
   - Owner-protected post deletion with custom confirmation modals.

3. **Campus Marketplace**:
   - Buy & sell pre-owned textbooks, study tables, cycles, electronics, and dorm appliances.
   - Multi-photo upload with Cloudinary integration.
   - "Mark as Sold" toggle and delete functionality.

4. **Owner / Broker Dashboard**:
   - Real-time lead count and property analytics.
   - Modern interactive status toggle (`Mark as Rented` / `Relist`).
   - Add new property modal with Cloudinary photo uploads.

---

## 🌐 Quick Deployment Guide

### 1. Deploy Backend (e.g. on [Render](https://render.com) or [Railway](https://railway.app))
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  ```env
  PORT=5000
  MONGO_URI=your_mongodb_atlas_connection_string
  JWT_SECRET=your_super_secret_jwt_key
  CLIENT_URL=https://your-frontend-app.vercel.app
  CLOUDINARY_CLOUD_NAME=your_cloudinary_name
  CLOUDINARY_API_KEY=your_cloudinary_key
  CLOUDINARY_API_SECRET=your_cloudinary_secret
  ```

### 2. Deploy Frontend (e.g. on [Vercel](https://vercel.com))
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  ```env
  VITE_API_URL=https://your-backend-service.onrender.com/api/v1
  ```
- *Note: `client/vercel.json` is already configured for seamless Single Page Application (SPA) routing.*


