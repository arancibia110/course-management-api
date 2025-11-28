import { Request, Response } from 'express';
import { AppDataSource } from '../../../infrastructure/database/data-source';
import { Course } from '../../../domain/entities/Course';
import { NotFoundError, BadRequestError } from '../../middleware/ErrorHandler';

export class CourseController {
  private courseRepository = AppDataSource.getRepository(Course);

  // GET /api/courses - Listar todos los cursos
  getAllCourses = async (req: Request, res: Response): Promise<void> => {
    const { page = 1, limit = 10, search, isActive } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .where('course.deletedAt IS NULL');

    // Filtro por búsqueda
    if (search) {
      queryBuilder.andWhere(
        '(course.name LIKE :search OR course.instructor LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Filtro por estado activo/inactivo
    if (isActive !== undefined) {
      queryBuilder.andWhere('course.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }

    const [courses, total] = await queryBuilder
      .orderBy('course.createdAt', 'DESC')
      .skip(skip)
      .take(limitNum)
      .getManyAndCount();

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  };

  // GET /api/courses/:id - Obtener un curso por ID
  getCourseById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const course = await this.courseRepository.findOne({
      where: { id, deletedAt: null as any },
      relations: ['userCourses', 'userCourses.user'],
    });

    if (!course) {
      throw new NotFoundError('Curso no encontrado');
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  };

  // POST /api/courses - Crear un nuevo curso
  createCourse = async (req: Request, res: Response): Promise<void> => {
    const courseData = req.body;

    // Validar que la fecha de inicio sea anterior a la de fin
    if (courseData.endDate && new Date(courseData.startDate) >= new Date(courseData.endDate)) {
      throw new BadRequestError('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    const course = this.courseRepository.create({
      ...courseData,
      currentStudents: 0,
    });

    await this.courseRepository.save(course);

    res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      data: course,
    });
  };

  // PUT /api/courses/:id - Actualizar un curso
  updateCourse = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    const course = await this.courseRepository.findOne({
      where: { id, deletedAt: null as any },
    });

    if (!course) {
      throw new NotFoundError('Curso no encontrado');
    }

    // Validar fechas si se están actualizando
    if (updateData.startDate || updateData.endDate) {
      const startDate = updateData.startDate ? new Date(updateData.startDate) : course.startDate;
      const endDate = updateData.endDate ? new Date(updateData.endDate) : course.endDate;

      if (endDate && startDate >= endDate) {
        throw new BadRequestError('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    // Actualizar campos
    Object.assign(course, updateData);

    await this.courseRepository.save(course);

    res.status(200).json({
      success: true,
      message: 'Curso actualizado exitosamente',
      data: course,
    });
  };

  // DELETE /api/courses/:id - Eliminar un curso (soft delete)
  deleteCourse = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const course = await this.courseRepository.findOne({
      where: { id, deletedAt: null as any },
    });

    if (!course) {
      throw new NotFoundError('Curso no encontrado');
    }

    // Soft delete
    course.deletedAt = new Date();
    course.isActive = false;

    await this.courseRepository.save(course);

    res.status(200).json({
      success: true,
      message: 'Curso eliminado exitosamente',
    });
  };

  // GET /api/courses/:id/students - Obtener estudiantes de un curso
  getCourseStudents = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const course = await this.courseRepository.findOne({
      where: { id, deletedAt: null as any },
      relations: ['userCourses', 'userCourses.user'],
    });

    if (!course) {
      throw new NotFoundError('Curso no encontrado');
    }

    const students = course.userCourses.map((uc) => ({
      id: uc.user.id,
      email: uc.user.email,
      firstName: uc.user.firstName,
      lastName: uc.user.lastName,
      enrollmentStatus: uc.status,
      enrolledAt: uc.enrolledAt,
      progress: uc.progress,
    }));

    res.status(200).json({
      success: true,
      data: {
        course: {
          id: course.id,
          name: course.name,
          currentStudents: course.currentStudents,
          maxStudents: course.maxStudents,
        },
        students,
      },
    });
  };
}
