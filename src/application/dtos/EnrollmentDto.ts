import { IsString, IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID('4', { message: 'userId debe ser un UUID válido' })
  userId: string;

  @IsUUID('4', { message: 'courseId debe ser un UUID válido' })
  courseId: string;
}
