import mongoose from 'mongoose';

const marketplaceItemSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the item'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['furniture', 'appliances', 'vehicles', 'books', 'other'],
      required: [true, 'Please select a category'],
    },
    price: {
      type: Number,
      required: [true, 'Please specify the price'],
      min: 0,
    },
    isNegotiable: {
      type: Boolean,
      default: true,
    },
    itemAge: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Please specify your location'],
      trim: true,
    },
    whatsapp: {
      type: String,
      required: [true, 'Please provide a WhatsApp number'],
      trim: true,
    },
    photos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    isSold: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

marketplaceItemSchema.index({ category: 1, isSold: 1 });
marketplaceItemSchema.index({ createdAt: -1 });

export default mongoose.model('MarketplaceItem', marketplaceItemSchema);
