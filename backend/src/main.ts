import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('API Foundation')
    .setDescription('Generic full-stack foundation — technical layer only')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
}

bootstrap();
