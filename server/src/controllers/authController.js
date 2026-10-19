import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Helper: Generate signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'default_jwt_secret_hommiez',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @desc    Register a new Student or Broker/Owner
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, collegeName, phone, businessName } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name, email, and password.',
      });
    }

    const assignedRole = role === 'broker' ? 'broker' : 'student';

    // 2. Broker-specific check: Phone number is required for students to contact them
    if (assignedRole === 'broker' && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Property owners and brokers must provide a phone number for student leads.',
      });
    }

    // 3. Check if email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // 4. Create new user account
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      collegeName: assignedRole === 'student' ? collegeName || '' : undefined,
      phone: assignedRole === 'broker' ? phone : undefined,
      businessName: assignedRole === 'broker' ? businessName || '' : undefined,
      isApprovedByAdmin: true,
    });

    // 5. Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: `Welcome to Hommiez! ${assignedRole === 'broker' ? 'Owner/Broker' : 'Student'} account created.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        phone: user.phone,
        businessName: user.businessName,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login existing user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Fetch user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        phone: user.phone,
        businessName: user.businessName,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/v1/auth/me
 * @access  Private (Requires JWT)
 */
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};
