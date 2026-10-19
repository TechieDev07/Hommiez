import FlatmatePost from '../models/FlatmatePost.js';

/**
 * @desc    Get all active flatmate posts with optional filters
 * @route   GET /api/v1/flatmates
 * @access  Public
 */
export const getFlatmatePosts = async (req, res, next) => {
  try {
    const { gender, maxBudget, region, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };
    if (gender) query.gender = gender;
    if (region) query.region = region;
    if (maxBudget) query.budget = { $lte: Number(maxBudget) };

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, totalCount] = await Promise.all([
      FlatmatePost.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      FlatmatePost.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: posts.length,
      totalCount,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new flatmate post
 * @route   POST /api/v1/flatmates
 * @access  Private (any logged-in user)
 */
export const createFlatmatePost = async (req, res, next) => {
  try {
    const { name, college, gender, budget, region, habits, bio, whatsapp } = req.body;

    const habitsArray = Array.isArray(habits)
      ? habits
      : typeof habits === 'string' && habits.trim()
        ? habits.split(',').map((h) => h.trim()).filter(Boolean)
        : [];

    const post = await FlatmatePost.create({
      poster: req.user._id,
      name: name || req.user.name,
      college: college || req.user.collegeName || 'College Student',
      gender,
      budget: Number(budget),
      region,
      habits: habitsArray,
      bio: bio || '',
      whatsapp: String(whatsapp).replace(/[^0-9]/g, ''),
    });

    res.status(201).json({
      success: true,
      message: 'Flatmate request published!',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate a flatmate post (owner only)
 * @route   PATCH /api/v1/flatmates/:id/deactivate
 * @access  Private (owner only)
 */
export const deactivateFlatmatePost = async (req, res, next) => {
  try {
    const post = await FlatmatePost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    if (post.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    post.isActive = false;
    await post.save();
    res.status(200).json({ success: true, message: 'Post deactivated.' });
  } catch (error) {
    next(error);
  }
};
