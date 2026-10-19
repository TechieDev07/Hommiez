import express from 'express';
import {
  getListings,
  getListingById,
  createListing,
  toggleListingStatus,
  getMyListings,
} from '../controllers/listingController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getListings);

// Broker dashboard: Must be defined before /:id to avoid matching 'my-listings' as an ID
router.get('/my-listings', protect, authorize('broker'), getMyListings);

// Single listing details
router.get('/:id', getListingById);

// Broker actions (Requires login + broker/owner role)
router.post('/', protect, authorize('broker'), createListing);
router.patch('/:id/status', protect, authorize('broker'), toggleListingStatus);

export default router;
