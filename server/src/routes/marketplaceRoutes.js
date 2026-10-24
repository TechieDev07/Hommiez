import express from 'express';
import {
  getMarketplaceItems,
  createMarketplaceItem,
  markItemSold,
  deleteMarketplaceItem,
} from '../controllers/marketplaceController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public / optionally authenticated: list all items
router.get('/', optionalAuth, getMarketplaceItems);

// Private: create a new item listing (any logged-in user)
router.post('/', protect, createMarketplaceItem);

// Private: mark item sold (owner only)
router.patch('/:id/sold', protect, markItemSold);

// Private: permanently delete an item (owner only)
router.delete('/:id', protect, deleteMarketplaceItem);

export default router;
