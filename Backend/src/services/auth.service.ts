import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import User from '../models/user.model';
import { redisClient } from '../config/database';
import { generateAccessToken, generateRefreshToken } from '../utils/token.utils';
import { sendVerificationEmail } from '../utils/email.utils';
import { asyncHandler } from '../middleware/async.middleware';
import { ErrorResponse } from '../utils/errorResponse';
import { sendSuccessResponse } from '../utils/response.utils';

/**
 * @desc    Register a new admin/user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    password,
    restaurantName,
    phone,
    address,
    firstName,
    lastName
  } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ErrorResponse('User already exists with this email', 400);
  }

  // Create user
  const user = await User.create({
    email,
    password,
    restaurant: {
      name: restaurantName,
      phone,
      address
    },
    // For now, we're creating admin users
    // In future, we might have different roles
    firstName,
    lastName
  });

  // Generate email verification token
  const verificationToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1d' }
  );

  // Send verification email
  await sendVerificationEmail(user.email, verificationToken);

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token in Redis (optional, for logout functionality)
  await redisClient.setEx(
    `refresh_token:${user._id}`,
    60 * 60 * 24 * 7, // 7 days
    refreshToken
  );

  // Set cookies
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Send response
  sendSuccessResponse(res, {
    user: {
      id: user._id,
      email: user.email,
      restaurant: user.restaurant,
      isVerified: user.isVerified
    }
  }, 'User registered successfully', 201);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new ErrorResponse('Please provide an email and password', 400);
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  // Check if user is verified
  if (!user.isVerified) {
    throw new ErrorResponse('Please verify your email before logging in', 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token in Redis
  await redisClient.setEx(
    `refresh_token:${user._id}`,
    60 * 60 * 24 * 7, // 7 days
    refreshToken
  );

  // Set cookies
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Send response
  sendSuccessResponse(res, {
    user: {
      id: user._id,
      email: user.email,
      restaurant: user.restaurant,
      isVerified: user.isVerified
    }
  }, 'Logged in successfully');
});

/**
 * @desc    Logout user (clear cookies and delete refresh token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Get user ID from request (set by auth middleware)
  const userId = req.user?._id;

  // Delete refresh token from Redis
  if (userId) {
    await redisClient.del(`refresh_token:${userId}`);
  }

  // Clear cookies
  res.clearCookie('token');
  res.clearCookie('refreshToken');

  sendSuccessResponse(res, null, 'Logged out successfully');
});

/**
 * @desc    Refresh access token
 * @route   GET /api/auth/refresh-token
 * @access  Private
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ErrorResponse('Refresh token not found', 401);
  }

  // Verify refresh token
  let payload: JwtPayload | string;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_SECRET || 'fallback_secret');
  } catch (err) {
    throw new ErrorResponse('Invalid refresh token', 401);
  }

  const { userId } = payload as { userId: string };

  // Check if refresh token exists in Redis
  const storedToken = await redisClient.get(`refresh_token:${userId}`);
  if (!storedToken || storedToken !== refreshToken) {
    throw new ErrorResponse('Invalid refresh token', 401);
  }

  // Generate new access token
  const accessToken = generateAccessToken(new Types.ObjectId(userId));

  // Set new cookie
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  sendSuccessResponse(res, { accessToken }, 'Token refreshed');
});

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify/:token
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token) {
    throw new ErrorResponse('Invalid token', 400);
  }

  let payload: JwtPayload | string;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (err) {
    throw new ErrorResponse('Invalid or expired token', 400);
  }

  const { userId } = payload as { userId: string };

  // Find user and update verification status
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  user.isVerified = true;
  await user.save();

  // In a real app, you might redirect to a frontend page
  res.status(200).send(`
    <h1>Email Verified Successfully</h1>
    <p>Your email has been verified. You can now close this window and return to the application.</p>
  `);
});

/**
 * @desc    Forgot password (send reset link)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Return same message to prevent user enumeration
    return sendSuccessResponse(res, null, 'If your email is registered, you will receive a reset link');
  }

  // Generate reset token (valid for 1 hour)
  const resetToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );

  // Save reset token to user (hashed) - in real app, store hash in DB
  // For simplicity, we'll just send email
  await sendPasswordResetEmail(user.email, resetToken);

  sendSuccessResponse(res, null, 'Password reset email sent');
});

/**
 * @desc    Reset password
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    throw new ErrorResponse('Invalid token', 400);
  }

  let payload: JwtPayload | string;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (err) {
    throw new ErrorResponse('Invalid or expired token', 400);
  }

  const { userId } = payload as { userId: string };

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  // Update password
  user.password = password;
  await user.save();

  // Invalidate all refresh tokens for this user (on password change)
  await redisClient.del(`refresh_token:${userId}`);

  sendSuccessResponse(res, null, 'Password reset successful');
});

/**
 * @desc    Get logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?._id).select('-password');

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  sendSuccessResponse(res, user);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { firstName, lastName, phone, address } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { firstName, lastName, 'restaurant.phone': phone, 'restaurant.address': address },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  sendSuccessResponse(res, user, 'Profile updated successfully');
});

export default {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
};