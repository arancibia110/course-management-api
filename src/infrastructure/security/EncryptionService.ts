import bcrypt from 'bcrypt';

export class EncryptionService {
  private readonly rounds: number;

  constructor() {
    this.rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }

    return { isValid: errors.length === 0, errors };
  }
}

export const encryptionService = new EncryptionService();
