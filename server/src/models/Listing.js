import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    broker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the listing'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['flat', 'pg'],
      required: [true, 'Please specify if this is a flat or a pg'],
    },
    rent: {
      type: Number,
      required: [true, 'Please provide the monthly rent amount'],
      min: 0,
    },
    deposit: {
      type: Number,
      required: [true, 'Please provide the security deposit amount'],
      min: 0,
    },
    brokerageFee: {
      type: Number,
      required: [true, 'Please declare the upfront brokerage fee (use 0 for zero-brokerage)'],
      min: 0,
      default: 0,
    },
    locationName: {
      type: String,
      required: [true, 'Please specify the neighborhood or area name'],
      trim: true,
    },
    distanceFromCampusKm: {
      type: Number,
      required: [true, 'Please specify distance from college campus in kilometers'],
      min: 0,
    },
    preferences: {
      gender: {
        type: String,
        enum: ['any', 'boys_only', 'girls_only'],
        default: 'any',
      },
      food: {
        type: String,
        enum: ['no_preference', 'veg_only', 'non_veg_allowed'],
        default: 'no_preference',
      },
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    photos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' }, // Used to delete image from Cloudinary
      },
    ],
    status: {
      type: String,
      enum: ['available', 'rented'],
      default: 'available',
    },
    // Automatic 30-day listing expiration
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      index: { expires: 0 }, // MongoDB automatically removes document after expiresAt
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast search & filtering without slow database scans
listingSchema.index({ status: 1, type: 1, rent: 1 });
listingSchema.index({ distanceFromCampusKm: 1 });
listingSchema.index({ createdAt: -1 });

export default mongoose.model('Listing', listingSchema);
