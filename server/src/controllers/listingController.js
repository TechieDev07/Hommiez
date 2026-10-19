import Listing from '../models/Listing.js';
import Lead from '../models/Lead.js';

/**
 * @desc    Get all active listings with fast filtering and pagination
 * @route   GET /api/v1/listings
 * @access  Public
 */
export const getListings = async (req, res, next) => {
  try {
    const {
      type,
      maxRent,
      maxDistance,
      gender,
      page = 1,
      limit = 12,
    } = req.query;

    // Filter criteria: only show available listings that haven't expired
    const query = {
      status: 'available',
      expiresAt: { $gt: new Date() },
    };

    if (type) query.type = type;
    if (maxRent) query.rent = { $lte: Number(maxRent) };
    if (maxDistance) query.distanceFromCampusKm = { $lte: Number(maxDistance) };
    if (gender && gender !== 'any') {
      query['preferences.gender'] = { $in: [gender, 'any'] };
    }

    const skip = (Number(page) - 1) * Number(limit);

    // .lean() skips full Mongoose document hydration, making queries 5x faster
    const [listings, totalCount] = await Promise.all([
      Listing.find(query)
        .select('-__v')
        .populate('broker', 'name businessName') // Only reveal broker name, NOT phone
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Listing.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: listings.length,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single listing details by ID
 * @route   GET /api/v1/listings/:id
 * @access  Public
 */
export const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('broker', 'name businessName')
      .lean();

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or has been removed.',
      });
    }

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new listing (Approved brokers only)
 * @route   POST /api/v1/listings
 * @access  Private (Broker)
 */
export const createListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      rent,
      deposit,
      brokerageFee,
      locationName,
      distanceFromCampusKm,
      preferences,
      amenities,
      photos,
    } = req.body;

    // Upfront brokerage fee must be specified (can be 0)
    if (brokerageFee === undefined || brokerageFee === null) {
      return res.status(400).json({
        success: false,
        message: 'Upfront brokerage fee must be stated (use 0 for zero-brokerage).',
      });
    }

    const listing = await Listing.create({
      broker: req.user._id,
      title,
      description,
      type,
      rent,
      deposit,
      brokerageFee,
      locationName,
      distanceFromCampusKm,
      preferences,
      amenities,
      photos: photos || [],
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully and is now live!',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle listing status (Available <-> Rented)
 * @route   PATCH /api/v1/listings/:id/status
 * @access  Private (Broker owner only)
 */
export const toggleListingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    // Ensure the broker owns this listing
    if (listing.broker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this listing.' });
    }

    listing.status = status || (listing.status === 'available' ? 'rented' : 'available');
    await listing.save();

    res.status(200).json({
      success: true,
      message: `Listing marked as ${listing.status}.`,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all listings posted by the currently logged in broker with lead counts
 * @route   GET /api/v1/listings/my-listings
 * @access  Private (Broker)
 */
export const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ broker: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Attach lead count to each listing
    const listingsWithLeadCounts = await Promise.all(
      listings.map(async (listing) => {
        const leadCount = await Lead.countDocuments({ listing: listing._id });
        return {
          ...listing,
          leadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: listingsWithLeadCounts,
    });
  } catch (error) {
    next(error);
  }
};
