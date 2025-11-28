import { IsString, IsInt, IsDate, IsOptional, Min, Max, IsBoolean, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name: string;

  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  description: string;

  @IsInt()
  @Min(1, { message: 'La duración debe ser al menos 1 hora' })
  @Max(1000, { message: 'La duración no puede exceder 1000 horas' })
  duration: number;

  @IsString()
  @MinLength(3)
  instructor: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  maxStudents?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCourseDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(10)
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  duration?: number;

  @IsString()
  @MinLength(3)
  @IsOptional()
  instructor?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  maxStudents?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
