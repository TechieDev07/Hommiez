import express from 'express';
import { unlockBrokerContact, getBrokerLeads } from '../controllers/leadController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Student action: Unlock broker contact (Requires logged-in student)
router.post(
  '/:listingId/unlock',
  protect,
  authorize('student'),
  unlockBrokerContact
);

// Broker action: View recent student leads
router.get('/my-leads', protect, authorize('broker'), getBrokerLeads);

export default router;
