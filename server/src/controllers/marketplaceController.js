import MarketplaceItem from '../models/MarketplaceItem.js';

/**
 * @desc    Get all marketplace items with optional category/negotiable filters
 * @route   GET /api/v1/marketplace
 * @access  Public
 */
export const getMarketplaceItems = async (req, res, next) => {
  try {
    const { category, isNegotiable, page = 1, limit = 20 } = req.query;

    const query = { isSold: false };
    if (category) query.category = category;
    if (isNegotiable !== undefined && isNegotiable !== '') {
      query.isNegotiable = isNegotiable === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, totalCount] = await Promise.all([
      MarketplaceItem.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      MarketplaceItem.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: items.length,
      totalCount,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new marketplace item listing
 * @route   POST /api/v1/marketplace
 * @access  Private (any logged-in user)
 */
export const createMarketplaceItem = async (req, res, next) => {
  try {
    const {
      title,
      category,
      price,
      isNegotiable,
      itemAge,
      description,
      location,
      whatsapp,
      photos, // array of { url, publicId } from Cloudinary upload step
    } = req.body;

    const item = await MarketplaceItem.create({
      seller: req.user._id,
      sellerName: req.user.name,
      title,
      category,
      price: Number(price),
      isNegotiable: isNegotiable === true || isNegotiable === 'true',
      itemAge: itemAge || '',
      description: description || '',
      location,
      whatsapp: String(whatsapp).replace(/[^0-9]/g, ''),
      photos: photos || [],
    });

    res.status(201).json({
      success: true,
      message: 'Item listed successfully!',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark item as sold
 * @route   PATCH /api/v1/marketplace/:id/sold
 * @access  Private (owner only)
 */
export const markItemSold = async (req, res, next) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    item.isSold = true;
    await item.save();
    res.status(200).json({ success: true, message: 'Item marked as sold.', data: item });
  } catch (error) {
    next(error);
  }
};
