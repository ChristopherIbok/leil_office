import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set the global prefix for all API routes to /api
  app.setGlobalPrefix('api');

  // Apply the ValidationPipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically strip properties that do not have decorators in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      transform: true, // Automatically transform plain objects to DTO class instances
    }),
  );

  await app.listen(4000);
}
bootstrap();