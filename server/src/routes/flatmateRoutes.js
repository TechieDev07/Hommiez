import express from 'express';
import {
  getFlatmatePosts,
  createFlatmatePost,
  deactivateFlatmatePost,
  deleteFlatmatePost,
} from '../controllers/flatmateController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public: list all active flatmate posts
router.get('/', getFlatmatePosts);

// Private: create a new flatmate post (any logged-in user)
router.post('/', protect, createFlatmatePost);

// Private: deactivate a post (owner only)
router.patch('/:id/deactivate', protect, deactivateFlatmatePost);

// Private: permanently delete a post (owner only)
router.delete('/:id', protect, deleteFlatmatePost);

export default router;
