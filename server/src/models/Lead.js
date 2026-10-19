import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    broker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate leads: A student unlocking the same listing twice counts as 1 lead
leadSchema.index({ student: 1, listing: 1 }, { unique: true });
leadSchema.index({ broker: 1, createdAt: -1 });

export default mongoose.model('Lead', leadSchema);
