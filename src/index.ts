import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { initializeDatabase } from './infrastructure/database/data-source';
import { ErrorHandler } from './interfaces/middleware/ErrorHandler';
import authRoutes from './interfaces/http/routes/auth.routes';
import courseRoutes from './interfaces/http/routes/course.routes';
import studentRoutes from './interfaces/http/routes/student.routes';
import userRoutes from './interfaces/http/routes/user.routes';
import enrollmentRoutes from './interfaces/http/routes/enrollment.routes';

dotenv.config();

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    
    this.initializeMiddlewares();
    this.initializeSwagger();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN?.split(',') || '*',
      credentials: true,
    }));

    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: 'Too many requests',
    });
    this.app.use('/api/', limiter);

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(compression());

    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined'));
    }
  }

  private initializeSwagger(): void {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Course Management API',
          version: '1.0.0',
          description: 'API RESTful para gestión de usuarios y cursos',
        },
        servers: [
          {
            url: `http://localhost:${this.port}`,
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      apis: ['./src/interfaces/http/routes/*.ts'],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  private initializeRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
      });
    });

    const apiPrefix = process.env.API_PREFIX || '/api';
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/courses`, courseRoutes);
    this.app.use(`${apiPrefix}/students`, studentRoutes);
    this.app.use(`${apiPrefix}/users`, userRoutes);
    this.app.use(`${apiPrefix}/enrollments`, enrollmentRoutes);
  }

  private initializeErrorHandling(): void {
    this.app.use(ErrorHandler.notFound);
    this.app.use(ErrorHandler.handle);
  }

  public async start(): Promise<void> {
    try {
      await initializeDatabase();

      this.app.listen(this.port, () => {
        console.log('🚀 ========================================');
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🚀 API Docs: http://localhost:${this.port}/api-docs`);
        console.log(`🚀 Health: http://localhost:${this.port}/health`);
        console.log('🚀 ========================================');
      });
    } catch (error) {
      console.error('❌ Error starting server:', error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start();

export default server;
