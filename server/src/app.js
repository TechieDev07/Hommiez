import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import marketplaceRoutes from './routes/marketplaceRoutes.js';
import flatmateRoutes from './routes/flatmateRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing for React frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parser middlewares for JSON and Form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hommiez API is up and running cleanly 🚀',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/flatmates', flatmateRoutes);

// Centralized Error Handler (must be after all routes)
app.use(errorHandler);

// Start server and connect to MongoDB
const startServer = async () => {
  if (process.env.MONGO_URI) {
    await connectDB();
  } else {
    console.warn('⚠️ No MONGO_URI specified in .env. Skipping DB connection.');
  }

  app.listen(PORT, () => {
    console.log(`🏠 Hommiez Server running on http://localhost:${PORT}`);
  });
};

startServer();

export default app;
