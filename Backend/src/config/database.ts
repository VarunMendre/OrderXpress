import mongoose from 'mongoose';
import { config } from 'dotenv';
import { createClient } from 'redis';

// Load environment variables
config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orderxpress';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Connect to MongoDB
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    } as any);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Redis client setup
 */
export const redisClient = createClient({
  url: REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};