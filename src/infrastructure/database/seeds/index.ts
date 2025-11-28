import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../../../domain/entities/User';
import { Course } from '../../../domain/entities/Course';
import { UserCourse, EnrollmentStatus } from '../../../domain/entities/UserCourse';
import { encryptionService } from '../../security/EncryptionService';

dotenv.config();

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepo = AppDataSource.getRepository(User);
    const courseRepo = AppDataSource.getRepository(Course);
    const userCourseRepo = AppDataSource.getRepository(UserCourse);

    // Limpiar datos existentes (solo si existen)
    try {
      await userCourseRepo.query('TRUNCATE TABLE user_courses');
      await courseRepo.query('TRUNCATE TABLE courses');
      await userRepo.query('TRUNCATE TABLE users');
      console.log('🗑️  Previous data cleared');
    } catch (error) {
      console.log('ℹ️  Tables are empty or don\'t exist yet');
    }

    // Crear usuarios
    console.log('👥 Creating users...');
    
    const admin = userRepo.create({
      email: 'admin@example.com',
      password: await encryptionService.hashPassword('Admin123!@#'),
      firstName: 'Admin',
      lastName: 'Sistema',
      role: UserRole.ADMIN,
      isActive: true,
    });

    const student1 = userRepo.create({
      email: 'alumno@example.com',
      password: await encryptionService.hashPassword('Alumno123!@#'),
      firstName: 'Juan',
      lastName: 'Pérez',
      role: UserRole.STUDENT,
      isActive: true,
    });

    const student2 = userRepo.create({
      email: 'maria@example.com',
      password: await encryptionService.hashPassword('Maria123!@#'),
      firstName: 'María',
      lastName: 'González',
      role: UserRole.STUDENT,
      isActive: true,
    });

    await userRepo.save([admin, student1, student2]);
    console.log('✅ Users created');

    // Crear cursos
    console.log('📚 Creating courses...');

    const course1 = courseRepo.create({
      name: 'JavaScript Avanzado',
      description: 'Curso completo de JavaScript moderno',
      duration: 40,
      instructor: 'Carlos Rodríguez',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      maxStudents: 30,
      isActive: true,
    });

    const course2 = courseRepo.create({
      name: 'Node.js y Express',
      description: 'Desarrollo de APIs RESTful',
      duration: 35,
      instructor: 'Ana Silva',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-03-30'),
      maxStudents: 25,
      isActive: true,
    });

    const course3 = courseRepo.create({
      name: 'React y TypeScript',
      description: 'Aplicaciones web modernas',
      duration: 45,
      instructor: 'Luis Fernández',
      startDate: new Date('2024-01-20'),
      maxStudents: 30,
      isActive: true,
    });

    await courseRepo.save([course1, course2, course3]);
    console.log('✅ Courses created');

    // Inscribir estudiantes
    console.log('🔗 Enrolling students...');

    const enrollment1 = userCourseRepo.create({
      userId: student1.id,
      courseId: course1.id,
      status: EnrollmentStatus.IN_PROGRESS,
      enrolledAt: new Date(),
      progress: 45,
    });

    const enrollment2 = userCourseRepo.create({
      userId: student1.id,
      courseId: course2.id,
      status: EnrollmentStatus.ENROLLED,
      enrolledAt: new Date(),
      progress: 0,
    });

    await userCourseRepo.save([enrollment1, enrollment2]);

    course1.currentStudents = 1;
    course2.currentStudents = 1;
    await courseRepo.save([course1, course2]);

    console.log('✅ Enrollments created');
    console.log('\n🎉 Seed completed successfully!\n');
    console.log('📝 Test credentials:');
    console.log('   Admin: admin@example.com / Admin123!@#');
    console.log('   Student: alumno@example.com / Alumno123!@#');
    console.log('   Student: maria@example.com / Maria123!@#\n');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
