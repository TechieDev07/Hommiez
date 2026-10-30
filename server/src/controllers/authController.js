import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { sendOtpEmail } from '../config/email.js';

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

/**
 * @desc    Initiate password reset: generate and email a 6-digit OTP
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordAttempts');

    // Generic response to prevent email enumeration
    const genericSuccessMessage = 'If an account exists with this email, an OTP has been sent to your inbox.';

    if (!user) {
      return res.status(200).json({
        success: true,
        message: genericSuccessMessage,
      });
    }

    // Generate secure 6-digit numeric OTP (100000 - 999999)
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing in DB (salt rounds: 10)
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(rawOtp, salt);

    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
    user.resetPasswordAttempts = 0; // Reset attempts counter
    await user.save();

    // Send OTP email
    try {
      await sendOtpEmail(user.email, rawOtp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // We still return success to not block users, email errors logged
    }

    res.status(200).json({
      success: true,
      message: genericSuccessMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP for password reset
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your email and the 6-digit OTP.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordAttempts'
    );

    if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({
        success: false,
        message: 'No active password reset request found or OTP has already been used.',
      });
    }

    // Check expiration
    if (new Date() > user.resetPasswordOtpExpires) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpires = undefined;
      user.resetPasswordAttempts = 0;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'This OTP has expired. Please request a new one.',
      });
    }

    // Rate limiting attempts (max 5 tries)
    if (user.resetPasswordAttempts >= 5) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpires = undefined;
      user.resetPasswordAttempts = 0;
      await user.save();
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.',
      });
    }

    const isMatch = await bcrypt.compare(otp.toString().trim(), user.resetPasswordOtp);

    if (!isMatch) {
      user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. You have ${5 - user.resetPasswordAttempts} attempt(s) remaining.`,
      });
    }

    // OTP is valid. Issue a temporary short-lived reset token (valid for 10 minutes)
    const resetSessionToken = jwt.sign(
      { id: user._id, type: 'password_reset' },
      process.env.JWT_SECRET || 'default_jwt_secret_hommiez',
      { expiresIn: '10m' }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      resetSessionToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit new password using resetSessionToken
 * @route   POST /api/v1/auth/reset-password
 * @access  Public (Validated with resetSessionToken)
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, resetSessionToken, newPassword } = req.body;

    if (!resetSessionToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Verify session token
    let decoded;
    try {
      decoded = jwt.verify(
        resetSessionToken,
        process.env.JWT_SECRET || 'default_jwt_secret_hommiez'
      );
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Your password reset session has expired or is invalid. Please start again.',
      });
    }

    const user = await User.findById(decoded.id).select(
      '+password +resetPasswordOtp +resetPasswordOtpExpires +resetPasswordAttempts'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    // Update password and clear OTP fields immediately
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.resetPasswordAttempts = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

