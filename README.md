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

