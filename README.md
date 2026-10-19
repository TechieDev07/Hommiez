# 🏠 Hommiez — Student Housing & Community Platform (MERN Stack)

**Hommiez** is a hyper-local housing platform designed specifically for college students to discover verified flats and PGs near their campus with **upfront brokerage fee transparency** and zero hidden costs.

---

## 🎨 Theme & Colors (Campus Teal & Warm Coral)
Configured in `client/src/index.css` via CSS variables. Edit these variables anytime to re-theme the entire website in 5 seconds:
* **Primary (Navbar & Accents):** `#0F766E` (Deep Campus Teal)
* **Action Buttons (Unlock Contact / Filter):** `#FF5A36` (Warm Energetic Coral)
* **Background:** `#F8FAFC` (Clean Off-White)

---

## 📂 Project Structure

```
hommiez/
├── server/               # Express REST API, Mongoose, JWT Auth
│   ├── src/
│   │   ├── config/       # MongoDB connection (db.js)
│   │   ├── models/       # User.js, Listing.js, Lead.js
│   │   ├── controllers/  # authController, listingController, leadController
│   │   ├── middlewares/  # authMiddleware (JWT & roles), errorHandler
│   │   ├── routes/       # authRoutes, listingRoutes, leadRoutes
│   │   └── app.js        # Express app entry point
│   ├── .env.example      # Environment variables template
│   └── package.json
│
└── client/               # React 18, Vite, React Router, Axios
    ├── src/
    │   ├── api/          # axiosClient.js (with auto-JWT interceptors)
    │   ├── context/      # AuthContext.jsx (global login state)
    │   ├── components/   # Navbar, ListingCard, FilterBar
    │   ├── pages/        # HomePage, ListingDetailPage, Login, Register, BrokerDashboard
    │   ├── App.jsx       # Route definitions
    │   └── index.css     # Theme variables & clean styling
    ├── index.html
    └── vite.config.js
```

---

## 🚀 How to Run Locally

### 1. Start the Backend (`/server`)
```bash
cd server
npm install
# Copy .env.example to .env and add your MongoDB Atlas URI & JWT secret
npm run dev
```
* Backend runs on: `http://localhost:5000`
* Health Check: `http://localhost:5000/api/v1/health`

### 2. Start the Frontend (`/client`)
```bash
cd client
npm install
npm run dev
```
* Frontend runs on: `http://localhost:5173`

---

## 🔑 Key Features Built in Phase 1

1. **Flexible Personal Email Registration:** Students and property owners/brokers can sign up using any personal email (Gmail, Outlook, etc.).
2. **Role-Based Experience:**
   * **Students / Seekers:** Browse live listings, filter by distance to college, budget, and flat vs PG, and unlock owner contact numbers.
   * **Brokers / Property Owners:** Post new flats and PGs, toggle `Available / Rented`, and see live lead counts of students who unlocked their listing.
3. **Upfront Brokerage Transparency:** Every listing prominently displays whether it is direct owner (₹0 brokerage) or states the exact fee upfront.
4. **Direct WhatsApp Connect:** When a student unlocks a property contact, it generates a pre-filled WhatsApp click-to-chat button directly to the owner.
5. **30-Day Auto-Expiration:** Listings have a MongoDB TTL index that expires inactive listings after 30 days unless renewed.
