import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { ValidationMiddleware } from '../../middleware/ValidationMiddleware';
import { AuthMiddleware } from '../../middleware/AuthMiddleware';
import { ErrorHandler } from '../../middleware/ErrorHandler';
import { CreateUserDto, UpdateUserDto, AdminChangePasswordDto } from '../../../application/dtos/UserDto';

const router = Router();
const userController = new UserController();

// Todas las rutas requieren autenticación y ser Admin
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.requireAdmin);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuarios (Solo Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', ErrorHandler.catchAsync(userController.getAllUsers));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID (Solo Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', ErrorHandler.catchAsync(userController.getUserById));

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario (Solo Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  ValidationMiddleware.validate(CreateUserDto),
  ErrorHandler.catchAsync(userController.createUser)
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar un usuario (Solo Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  ValidationMiddleware.validate(UpdateUserDto),
  ErrorHandler.catchAsync(userController.updateUser)
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario (Solo Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', ErrorHandler.catchAsync(userController.deleteUser));

/**
 * @swagger
 * /api/users/{id}/change-password:
 *   put:
 *     summary: Admin cambia contraseña de un usuario (Solo Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id/change-password',
  ValidationMiddleware.validate(AdminChangePasswordDto),
  ErrorHandler.catchAsync(userController.adminChangePassword)
);

export default router;
