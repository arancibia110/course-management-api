import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserCourse } from './UserCourse';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ length: 150 })
  instructor: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ name: 'max_students', type: 'int', default: 30 })
  maxStudents: number;

  @Column({ name: 'current_students', type: 'int', default: 0 })
  currentStudents: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => UserCourse, userCourse => userCourse.course)
  userCourses: UserCourse[];

  hasAvailableSpots(): boolean {
    return this.currentStudents < this.maxStudents;
  }

  incrementStudents(): void {
    if (this.currentStudents < this.maxStudents) {
      this.currentStudents++;
    }
  }

  decrementStudents(): void {
    if (this.currentStudents > 0) {
      this.currentStudents--;
    }
  }
}
