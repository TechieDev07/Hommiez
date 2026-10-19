import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      // Any personal email (Gmail, Yahoo, Outlook, etc.) is welcome!
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Prevents password from leaking in API responses
    },
    role: {
      type: String,
      enum: ['student', 'broker', 'admin'],
      default: 'student',
    },

    // --- Student Profile Fields ---
    collegeName: {
      type: String,
      trim: true,
      default: '', // e.g. "TIET", "VIT", "DU", etc.
    },

    // --- Broker / Property Owner Fields ---
    phone: {
      type: String,
      trim: true,
      // Stored for brokers; revealed to logged-in students
    },
    businessName: {
      type: String,
      trim: true,
      default: '',
    },
    isApprovedByAdmin: {
      type: Boolean,
      default: true, // Set to true by default for frictionless onboarding
    },
  },
  {
    timestamps: true,
  }
);

// Hash password automatically before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
