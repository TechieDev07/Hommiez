import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas
 * Uses environment variable MONGO_URI from .env
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code if database can't connect
    process.exit(1);
  }
};
