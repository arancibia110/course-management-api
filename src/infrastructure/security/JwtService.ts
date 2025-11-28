import jwt from 'jsonwebtoken';
import { UserRole } from '../../domain/entities/User';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly refreshSecret: string;
  private readonly expiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn });
  }

  generateTokenPair(payload: JwtPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.refreshSecret) as JwtPayload;
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }
}

export const jwtService = new JwtService();
