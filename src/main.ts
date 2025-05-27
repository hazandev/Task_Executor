import * as dotenv from 'dotenv';
dotenv.config(); // Load .env file at the very beginning

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators
      transform: true, // Transform payloads to DTO instances
      // forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present (optional)
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Task Executor API')
    .setDescription('API for managing and executing sum/multiply tasks via a BullMQ queue.')
    .setVersion('1.0')
    .addTag('Tasks', 'Endpoints for task creation, status, results, and SSE events')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Optional: to persist authorization data on browser refresh
    },
  });

  const port = process.env.PORT || 3000;
  const hostname = 'localhost'; // Explicitly set hostname

  await app.listen(port, hostname); // Pass hostname to listen method
  logger.log(`Application is running on: http://${hostname}:${port}`); // Update log message to be more specific
  logger.log(`Swagger API documentation available at http://${hostname}:${port}/api`); // Update log message
}

bootstrap().catch(err => {
  console.error('Application failed to start:', err);
  process.exit(1);
}); 