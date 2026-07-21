import { SignOptions, Secret } from 'jsonwebtoken';
import { Types } from 'mongoose';

/**
 * Generate access token
 * @param userId - User ID
 * @param role - User role
 * @returns Signed JWT token
 */
export const generateAccessToken = (
  userId: string | Types.ObjectId,
  role: string = 'user'
): string => {
  const payload = {
    userId: userId.toString(),
    role
  };

  const secret: Secret = process.env.JWT_SECRET || 'fallback_secret';
  const options: SignOptions = {
    // cast to any to satisfy differing type expectations across dependencies
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any
  };

  return require('jsonwebtoken').sign(payload, secret, options);
};

/**
 * Generate refresh token
 * @param userId - User ID
 * @returns Signed JWT refresh token
 */
export const generateRefreshToken = (
  userId: string | Types.ObjectId
): string => {
  const payload = {
    userId: userId.toString()
  };

  const secret: Secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_secret';
  const options: SignOptions = {
    // cast to any to satisfy differing type expectations across dependencies
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any
  };

  return require('jsonwebtoken').sign(payload, secret, options);
};

/**
 * Verify token
 * @param token - JWT token
 * @returns Decoded payload or throws error
 */
export const verifyToken = (token: string) => {
  const secret: Secret = process.env.JWT_SECRET || 'fallback_secret';
  return require('jsonwebtoken').verify(token, secret);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};