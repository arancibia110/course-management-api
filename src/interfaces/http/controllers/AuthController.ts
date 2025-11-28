import { Request, Response } from 'express';
import { AppDataSource } from '../../../infrastructure/database/data-source';
import { User } from '../../../domain/entities/User';
import { encryptionService } from '../../../infrastructure/security/EncryptionService';
import { jwtService } from '../../../infrastructure/security/JwtService';
import { UnauthorizedError, NotFoundError } from '../../middleware/ErrorHandler';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User is inactive');
    }

    const isPasswordValid = await encryptionService.comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    user.lastLogin = new Date();
    await this.userRepository.save(user);

    const tokens = jwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        ...tokens,
      },
    });
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: null as any },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
    });
  };
}
