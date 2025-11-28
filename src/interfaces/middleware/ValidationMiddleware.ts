import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class ValidationMiddleware {
  static validate<T extends object>(dtoClass: new () => T) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const dtoInstance = plainToClass(dtoClass, req.body);
        const errors = await validate(dtoInstance);

        if (errors.length > 0) {
          const formattedErrors: Record<string, string[]> = {};
          errors.forEach((error) => {
            if (error.constraints) {
              formattedErrors[error.property] = Object.values(error.constraints);
            }
          });

          res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors,
          });
          return;
        }

        req.body = dtoInstance;
        next();
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Validation error',
        });
      }
    };
  }
}
