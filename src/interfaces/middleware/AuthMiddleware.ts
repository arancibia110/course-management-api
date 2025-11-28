import { Request, Response, NextFunction } from 'express';
import { jwtService, JwtPayload } from '../../infrastructure/security/JwtService';
import { UserRole } from '../../domain/entities/User';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export class AuthMiddleware {
  static authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({ success: false, message: 'No token provided' });
        return;
      }

      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        res.status(401).json({ success: false, message: 'Invalid token format' });
        return;
      }

      const payload = jwtService.verifyAccessToken(token);
      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  }

  static requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    next();
  }
}
