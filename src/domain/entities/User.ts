import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserCourse } from './UserCourse';

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login', type: 'datetime', nullable: true })
  lastLogin: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => UserCourse, userCourse => userCourse.user)
  userCourses: UserCourse[];

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isStudent(): boolean {
    return this.role === UserRole.STUDENT;
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.isActive = false;
  }
}
