import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksGateway } from './tasks.gateway';
import awsConfig from './aws.config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HealthModule } from './health/health.module';

@Global()
@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      load: [awsConfig],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_COGNITO_USER_POOL_ID: Joi.string().required(),
        AWS_COGNITO_CLIENT_ID: Joi.string().required(),
        AWS_S3_BUCKET: Joi.string().required(),
        PORT: Joi.number().default(4000),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HealthModule,
  ],
  controllers: [
    AuthController, 
    ProjectsController, 
    TasksController, 
    UsersController
  ],
  providers: [
    AuthService, 
    PrismaService, 
    JwtStrategy, 
    ProjectsService, 
    TasksService, 
    TasksGateway, 
    UsersService
  ],
  exports: [AuthService, PrismaService], // Export PrismaService for use in other modules
})
export class AppModule {}