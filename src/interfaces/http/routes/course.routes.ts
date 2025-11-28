import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';
import { ValidationMiddleware } from '../../middleware/ValidationMiddleware';
import { AuthMiddleware } from '../../middleware/AuthMiddleware';
import { ErrorHandler } from '../../middleware/ErrorHandler';
import { CreateCourseDto, UpdateCourseDto } from '../../../application/dtos/CourseDto';

const router = Router();
const courseController = new CourseController();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware.authenticate);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Listar todos los cursos
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 */
router.get('/', ErrorHandler.catchAsync(courseController.getAllCourses));

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Obtener un curso por ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', ErrorHandler.catchAsync(courseController.getCourseById));

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Crear un nuevo curso (Solo Admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  AuthMiddleware.requireAdmin,
  ValidationMiddleware.validate(CreateCourseDto),
  ErrorHandler.catchAsync(courseController.createCourse)
);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Actualizar un curso (Solo Admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  AuthMiddleware.requireAdmin,
  ValidationMiddleware.validate(UpdateCourseDto),
  ErrorHandler.catchAsync(courseController.updateCourse)
);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Eliminar un curso (Solo Admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  AuthMiddleware.requireAdmin,
  ErrorHandler.catchAsync(courseController.deleteCourse)
);

/**
 * @swagger
 * /api/courses/{id}/students:
 *   get:
 *     summary: Obtener estudiantes de un curso
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id/students',
  AuthMiddleware.requireAdmin,
  ErrorHandler.catchAsync(courseController.getCourseStudents)
);

export default router;
