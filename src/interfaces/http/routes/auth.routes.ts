import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { ValidationMiddleware } from '../../middleware/ValidationMiddleware';
import { AuthMiddleware } from '../../middleware/AuthMiddleware';
import { ErrorHandler } from '../../middleware/ErrorHandler';
import { LoginDto } from '../../../application/dtos/UserDto';

const router = Router();
const authController = new AuthController();

router.post(
  '/login',
  ValidationMiddleware.validate(LoginDto),
  ErrorHandler.catchAsync(authController.login)
);

router.get(
  '/me',
  AuthMiddleware.authenticate,
  ErrorHandler.catchAsync(authController.getProfile)
);

export default router;
