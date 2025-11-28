import { Request, Response } from 'express';
import { AppDataSource } from '../../../infrastructure/database/data-source';
import { UserCourse } from '../../../domain/entities/UserCourse';
import { NotFoundError } from '../../middleware/ErrorHandler';

export class StudentController {
  private userCourseRepository = AppDataSource.getRepository(UserCourse);

  // GET /api/students/me/courses - Ver MIS cursos inscritos
  getMyCourses = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    const enrollments = await this.userCourseRepository.find({
      where: { userId },
      relations: ['course'],
      order: { enrolledAt: 'DESC' },
    });

    // Filtrar cursos que no han sido eliminados
    const activeCourses = enrollments.filter((e) => !e.course.deletedAt);

    const coursesData = activeCourses.map((enrollment) => ({
      enrollmentId: enrollment.id,
      courseId: enrollment.course.id,
      name: enrollment.course.name,
      description: enrollment.course.description,
      duration: enrollment.course.duration,
      instructor: enrollment.course.instructor,
      startDate: enrollment.course.startDate,
      endDate: enrollment.course.endDate,
      status: enrollment.status,
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
    }));

    res.status(200).json({
      success: true,
      message: 'Mis cursos obtenidos exitosamente',
      data: {
        totalCourses: coursesData.length,
        courses: coursesData,
      },
    });
  };

  // GET /api/students/me/courses/:courseId - Ver detalle de MI curso
  getMyCourseDetail = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { courseId } = req.params;

    const enrollment = await this.userCourseRepository.findOne({
      where: { userId, courseId },
      relations: ['course'],
    });

    if (!enrollment || enrollment.course.deletedAt) {
      throw new NotFoundError('No estás inscrito en este curso');
    }

    res.status(200).json({
      success: true,
      data: {
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
        },
        course: {
          id: enrollment.course.id,
          name: enrollment.course.name,
          description: enrollment.course.description,
          duration: enrollment.course.duration,
          instructor: enrollment.course.instructor,
          startDate: enrollment.course.startDate,
          endDate: enrollment.course.endDate,
          currentStudents: enrollment.course.currentStudents,
          maxStudents: enrollment.course.maxStudents,
          isActive: enrollment.course.isActive,
        },
      },
    });
  };
}
