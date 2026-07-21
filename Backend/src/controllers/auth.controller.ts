import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.util';
import { redisClient } from '../config/redis.config';
import { sendVerificationEmail } from '../utils/email.util';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

/**
 * @desc    Register a new admin/restaurant owner
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, restaurantName, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      restaurant: {
        name: restaurantName,
        phone,
        address
      }
    });

    // Generate verification token
    const verificationToken = uuidv4();
    await redisClient.setEx(
      `verify:${verificationToken}`,
      3600, // 1 hour expiry
      user._id.toString()
    );

    // Send verification email (in production)
    // await sendVerificationEmail(email, verificationToken);

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Store refresh token in Redis
    await redisClient.setEx(
      `refresh:${user._id}`,
      7 * 24 * 60 * 60, // 7 days
      refreshToken
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Store refresh token in Redis
    await redisClient.setEx(
      `refresh:${user._id}`,
      7 * 24 * 60 * 60, // 7 days
      refreshToken
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId; // From auth middleware

    // Remove refresh token from Redis
    await redisClient.del(`refresh:${userId}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Private
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId; // From auth middleware
    const refreshToken = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token exists in Redis
    const storedToken = await redisClient.get(`refresh:${userId}`);
    if (storedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Verify token
    const decoded = verifyToken(refreshToken) as { userId: string; role: string };
    if (decoded.userId !== userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(userId, decoded.role);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};