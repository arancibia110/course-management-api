import { Request, Response } from 'express';
import { AppDataSource } from '../../../infrastructure/database/data-source';
import { UserCourse, EnrollmentStatus } from '../../../domain/entities/UserCourse';
import { User, UserRole } from '../../../domain/entities/User';
import { Course } from '../../../domain/entities/Course';
import { NotFoundError, BadRequestError, ConflictError } from '../../middleware/ErrorHandler';

export class EnrollmentController {
  private userCourseRepository = AppDataSource.getRepository(UserCourse);
  private userRepository = AppDataSource.getRepository(User);
  private courseRepository = AppDataSource.getRepository(Course);

  // POST /api/enrollments - Inscribir un alumno a un curso
  enrollStudent = async (req: Request, res: Response): Promise<void> => {
    const { userId, courseId } = req.body;

    // Verificar que el usuario exista y sea estudiante
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: null as any },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (user.role !== UserRole.STUDENT) {
      throw new BadRequestError('Solo se pueden inscribir estudiantes');
    }

    if (!user.isActive) {
      throw new BadRequestError('El usuario no está activo');
    }

    // Verificar que el curso exista
    const course = await this.courseRepository.findOne({
      where: { id: courseId, deletedAt: null as any },
    });

    if (!course) {
      throw new NotFoundError('Curso no encontrado');
    }

    if (!course.isActive) {
      throw new BadRequestError('El curso no está activo');
    }

    // Verificar que el curso tenga cupos disponibles
    if (!course.hasAvailableSpots()) {
      throw new BadRequestError('El curso no tiene cupos disponibles');
    }

    // Verificar que el alumno no esté ya inscrito
    const existingEnrollment = await this.userCourseRepository.findOne({
      where: { userId, courseId },
    });

    if (existingEnrollment) {
      throw new ConflictError('El alumno ya está inscrito en este curso');
    }

    // Crear la inscripción
    const enrollment = this.userCourseRepository.create({
      userId,
      courseId,
      status: EnrollmentStatus.ENROLLED,
      enrolledAt: new Date(),
      progress: 0,
    });

    await this.userCourseRepository.save(enrollment);

    // Incrementar el contador de estudiantes en el curso
    course.incrementStudents();
    await this.courseRepository.save(course);

    res.status(201).json({
      success: true,
      message: 'Alumno inscrito exitosamente',
      data: {
        enrollmentId: enrollment.id,
        userId: user.id,
        userName: user.fullName,
        courseId: course.id,
        courseName: course.name,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
      },
    });
  };

  // DELETE /api/enrollments/:enrollmentId - Desinscribir un alumno
  unenrollStudent = async (req: Request, res: Response): Promise<void> => {
    const { enrollmentId } = req.params;

    const enrollment = await this.userCourseRepository.findOne({
      where: { id: enrollmentId },
      relations: ['course', 'user'],
    });

    if (!enrollment) {
      throw new NotFoundError('Inscripción no encontrada');
    }

    // Disminuir el contador de estudiantes en el curso
    enrollment.course.decrementStudents();
    await this.courseRepository.save(enrollment.course);

    // Eliminar la inscripción
    await this.userCourseRepository.remove(enrollment);

    res.status(200).json({
      success: true,
      message: 'Alumno desinscrito exitosamente',
    });
  };

  // GET /api/enrollments - Listar todas las inscripciones
  getAllEnrollments = async (req: Request, res: Response): Promise<void> => {
    const { page = 1, limit = 10, userId, courseId } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const queryBuilder = this.userCourseRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.user', 'user')
      .leftJoinAndSelect('enrollment.course', 'course')
      .where('user.deletedAt IS NULL')
      .andWhere('course.deletedAt IS NULL');

    // Filtro por usuario
    if (userId) {
      queryBuilder.andWhere('enrollment.userId = :userId', { userId });
    }

    // Filtro por curso
    if (courseId) {
      queryBuilder.andWhere('enrollment.courseId = :courseId', { courseId });
    }

    const [enrollments, total] = await queryBuilder
      .orderBy('enrollment.enrolledAt', 'DESC')
      .skip(skip)
      .take(limitNum)
      .getManyAndCount();

    const enrollmentsData = enrollments.map((e) => ({
      enrollmentId: e.id,
      user: {
        id: e.user.id,
        email: e.user.email,
        fullName: e.user.fullName,
      },
      course: {
        id: e.course.id,
        name: e.course.name,
      },
      status: e.status,
      progress: e.progress,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        enrollments: enrollmentsData,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  };
}
