import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../../domain/entities/User';
import { Course } from '../../domain/entities/Course';
import { UserCourse } from '../../domain/entities/UserCourse';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'course_user',
  password: process.env.DB_PASSWORD || 'course_pass123',
  database: process.env.DB_DATABASE || 'course_management',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [User, Course, UserCourse],
  migrations: [],
  subscribers: [],
  charset: 'utf8mb4',
  extra: {
    connectionLimit: 10,
  },
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
};
