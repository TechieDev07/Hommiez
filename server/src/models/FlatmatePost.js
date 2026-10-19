import mongoose from 'mongoose';

const flatmatePostSchema = new mongoose.Schema(
  {
    poster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: 80,
    },
    college: {
      type: String,
      trim: true,
      default: 'College Student',
    },
    gender: {
      type: String,
      enum: ['boys_only', 'girls_only'],
      required: [true, 'Please specify gender preference'],
    },
    budget: {
      type: Number,
      required: [true, 'Please specify your monthly budget'],
      min: 0,
    },
    region: {
      type: String,
      required: [true, 'Please specify your preferred region'],
      trim: true,
    },
    habits: [
      {
        type: String,
        trim: true,
      },
    ],
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    whatsapp: {
      type: String,
      required: [true, 'Please provide a WhatsApp number'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

flatmatePostSchema.index({ gender: 1, budget: 1, region: 1 });
flatmatePostSchema.index({ createdAt: -1 });

export default mongoose.model('FlatmatePost', flatmatePostSchema);
