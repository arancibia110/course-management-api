import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Course } from './Course';

export enum EnrollmentStatus {
  ENROLLED = 'ENROLLED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
}

@Entity('user_courses')
export class UserCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ name: 'course_id', type: 'varchar', length: 36 })
  courseId: string;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ENROLLED,
  })
  status: EnrollmentStatus;

  @Column({ name: 'enrolled_at', type: 'datetime' })
  enrolledAt: Date;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'progress', type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.userCourses)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, course => course.userCourses)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
