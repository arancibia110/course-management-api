import { Request, Response } from 'express';
import { AppDataSource } from '../../../infrastructure/database/data-source';
import { User, UserRole } from '../../../domain/entities/User';
import { encryptionService } from '../../../infrastructure/security/EncryptionService';
import { NotFoundError, BadRequestError, ConflictError } from '../../middleware/ErrorHandler';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  // GET /api/users - Listar usuarios con filtros
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    const { page = 1, limit = 10, search, role, isActive } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL');

    // Filtro por búsqueda (email, nombre, apellido)
    if (search) {
      queryBuilder.andWhere(
        '(user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Filtro por rol
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // Filtro por estado activo
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }

    const [users, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limitNum)
      .getManyAndCount();

    res.status(200).json({
      success: true,
      data: {
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          fullName: u.fullName,
          role: u.role,
          isActive: u.isActive,
          lastLogin: u.lastLogin,
          createdAt: u.createdAt,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  };

  // GET /api/users/:id - Obtener un usuario por ID
  getUserById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const user = await this.userRepository.findOne({
      where: { id, deletedAt: null as any },
      relations: ['userCourses', 'userCourses.course'],
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        courses: user.userCourses
          .filter((uc) => !uc.course.deletedAt)
          .map((uc) => ({
            courseId: uc.course.id,
            courseName: uc.course.name,
            status: uc.status,
            progress: uc.progress,
            enrolledAt: uc.enrolledAt,
          })),
      },
    });
  };

  // POST /api/users - Crear un nuevo usuario
  createUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password, firstName, lastName, role, isActive } = req.body;

    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    // Validar contraseña segura
    const passwordValidation = encryptionService.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(passwordValidation.errors.join(', '));
    }

    // Encriptar contraseña
    const hashedPassword = await encryptionService.hashPassword(password);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || UserRole.STUDENT,
      isActive: isActive !== undefined ? isActive : true,
    });

    await this.userRepository.save(user);

    // No devolver la contraseña
    const { password: _, ...userData } = user;

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: userData,
    });
  };

  // PUT /api/users/:id - Actualizar un usuario
  updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    const user = await this.userRepository.findOne({
      where: { id, deletedAt: null as any },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Si se está actualizando el email, verificar que no exista
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateData.email },
      });

      if (existingUser) {
        throw new ConflictError('El email ya está registrado');
      }
    }

    // Actualizar campos
    Object.assign(user, updateData);

    await this.userRepository.save(user);

    const { password: _, ...userData } = user;

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: userData,
    });
  };

  // DELETE /api/users/:id - Eliminar un usuario (soft delete)
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const user = await this.userRepository.findOne({
      where: { id, deletedAt: null as any },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Soft delete
    user.softDelete();

    await this.userRepository.save(user);

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  };

  // PUT /api/users/:id/change-password - Admin cambia contraseña de usuario
  adminChangePassword = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Validar contraseña segura
    const passwordValidation = encryptionService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(passwordValidation.errors.join(', '));
    }

    // Encriptar nueva contraseña
    user.password = await encryptionService.hashPassword(newPassword);

    await this.userRepository.save(user);

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  };
}
