import Lead from '../models/Lead.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';

/**
 * @desc    Unlock broker contact details for a listing (Verified Students only)
 *          Records a Lead for the broker and returns the broker's phone number
 * @route   POST /api/v1/leads/:listingId/unlock
 * @access  Private (Verified Student)
 */
export const unlockBrokerContact = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    // 1. Fetch listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    // 2. Fetch broker with phone number
    const broker = await User.findById(listing.broker);
    if (!broker || !broker.phone) {
      return res.status(404).json({
        success: false,
        message: 'Broker contact information is currently unavailable.',
      });
    }

    // 3. Record or update Lead (upsert ensures no duplicate counting)
    await Lead.findOneAndUpdate(
      { student: req.user._id, listing: listing._id },
      { broker: broker._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 4. Build a pre-filled WhatsApp click-to-chat link
    const cleanPhone = broker.phone.replace(/[^0-9]/g, '');
    const prefilledMessage = encodeURIComponent(
      `Hi ${broker.name}, I am a student from college interested in your listing: "${listing.title}" on Hommiez.`
    );
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${prefilledMessage}`;

    res.status(200).json({
      success: true,
      message: 'Broker contact unlocked successfully!',
      contact: {
        brokerName: broker.name,
        businessName: broker.businessName || 'Independent Broker',
        phone: broker.phone,
        whatsappUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all leads generated for the currently logged in broker
 * @route   GET /api/v1/leads/my-leads
 * @access  Private (Broker)
 */
export const getBrokerLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find({ broker: req.user._id })
      .populate('student', 'name email')
      .populate('listing', 'title rent locationName')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};
