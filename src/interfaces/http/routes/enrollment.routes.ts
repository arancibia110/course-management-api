import { Router } from 'express';
import { EnrollmentController } from '../controllers/EnrollmentController';
import { ValidationMiddleware } from '../../middleware/ValidationMiddleware';
import { AuthMiddleware } from '../../middleware/AuthMiddleware';
import { ErrorHandler } from '../../middleware/ErrorHandler';
import { CreateEnrollmentDto } from '../../../application/dtos/EnrollmentDto';

const router = Router();
const enrollmentController = new EnrollmentController();

// Todas las rutas requieren autenticación y ser Admin
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.requireAdmin);

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Listar inscripciones (Solo Admin)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', ErrorHandler.catchAsync(enrollmentController.getAllEnrollments));

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Inscribir alumno a curso (Solo Admin)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  ValidationMiddleware.validate(CreateEnrollmentDto),
  ErrorHandler.catchAsync(enrollmentController.enrollStudent)
);

/**
 * @swagger
 * /api/enrollments/{enrollmentId}:
 *   delete:
 *     summary: Desinscribir alumno de curso (Solo Admin)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:enrollmentId', ErrorHandler.catchAsync(enrollmentController.unenrollStudent));

export default router;
