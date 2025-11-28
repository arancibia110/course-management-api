import { Router } from 'express';
import { StudentController } from '../controllers/StudentController';
import { AuthMiddleware } from '../../middleware/AuthMiddleware';
import { ErrorHandler } from '../../middleware/ErrorHandler';

const router = Router();
const studentController = new StudentController();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware.authenticate);

/**
 * @swagger
 * /api/students/me/courses:
 *   get:
 *     summary: Ver mis cursos inscritos (Solo Estudiantes)
 *     description: Endpoint principal para que el alumno vea su listado de cursos
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos del estudiante
 *       401:
 *         description: No autenticado
 */
router.get(
  '/me/courses',
  ErrorHandler.catchAsync(studentController.getMyCourses)
);

/**
 * @swagger
 * /api/students/me/courses/{courseId}:
 *   get:
 *     summary: Ver detalle de un curso inscrito (Solo Estudiantes)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/me/courses/:courseId',
  ErrorHandler.catchAsync(studentController.getMyCourseDetail)
);

export default router;
