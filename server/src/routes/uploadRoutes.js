import express from 'express';
import { upload } from '../middlewares/uploadMiddleware.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @desc    Upload up to 5 listing photos to Cloudinary
 * @route   POST /api/v1/upload
 * @access  Private (Owner / Broker)
 */
router.post(
  '/',
  protect,
  authorize('broker'),
  upload.array('photos', 5),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one image file to upload.',
      });
    }

    // Map uploaded files to URL and publicId format expected by Listing model
    const uploadedPhotos = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    res.status(200).json({
      success: true,
      message: 'Photos uploaded successfully!',
      photos: uploadedPhotos,
    });
  }
);

export default router;
