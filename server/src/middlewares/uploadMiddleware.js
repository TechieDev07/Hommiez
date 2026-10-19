import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configure storage destination and folder on Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hommiez_listings',
    allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }], // Automatic optimization
  },
});

// Multer upload middleware (Max 5 photos at once, 5MB limit each)
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max per photo
});
