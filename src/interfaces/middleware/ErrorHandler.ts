import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found') {
    super(404, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(400, message);
  }
}

export class ErrorHandler {
  static handle(err: Error, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
      return;
    }

    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }

  static notFound(req: Request, res: Response): void {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  }

  static catchAsync(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}
