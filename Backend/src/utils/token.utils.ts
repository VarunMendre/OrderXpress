import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { Types } from 'mongoose';

/**
 * Generate access token
 * @param userId - User ID
 * @param role - User role (optional)
 * @returns Signed JWT token
 */
export const generateAccessToken = (userId: string | Types.ObjectId, role: string = 'user'): string => {
  const payload = {
    userId: userId.toString(),
    role
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '15m' } // Access token expires in 15 minutes
  );
};

/**
 * Generate refresh token
 * @param userId - User ID
 * @returns Signed JWT refresh token
 */
export const generateRefreshToken = (userId: string | Types.ObjectId): string => {
  const payload = {
    userId: userId.toString()
  };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' } // Refresh token expires in 7 days
  );
};

/**
 * Verify token
 * @param token - JWT token to verify
 * @returns Decoded payload or throws error
 */
export const verifyToken = (token: string): JwtPayload | string => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
};

/**
 * Verify refresh token (using refresh secret)
 * @param token - Refresh token to verify
 * @returns Decoded payload or throws error
 */
export const verifyRefreshToken = (token: string): JwtPayload | string => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_secret'
  );
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken
};