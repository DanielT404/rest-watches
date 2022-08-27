import helmet from 'helmet';
import * as compression from 'compression';

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, NestApplicationOptions } from '@nestjs/common';
import { AppModule } from './app.module';
import { isPort } from 'class-validator';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    throw new Error(
      'CORS_ORIGIN environment variable is required in production environment.'
    );
  }
  if (process.env.APP_PORT && !isPort(process.env.APP_PORT as string)) {
    throw new Error(
      'APP_PORT environment variable is not set to a valid port. Accepted values: 0 - 65535'
    );
  }

  const options: NestApplicationOptions = {
    cors: {
      origin:
        process.env.NODE_ENV === 'development' ? '*' : process.env.CORS_ORIGIN,
      methods: 'GET, POST, PATCH, DELETE',
      maxAge: 600
    }
  };
  const app = await NestFactory.create(AppModule, options);
  const config = new DocumentBuilder()
    .setTitle('Watch REST API')
    .setDescription('Available REST API endpoints')
    .setVersion('1.0')
    .addTag('watches')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(
    process.env.APP_PORT ? parseInt(process.env.APP_PORT as string) : 3000
  );
}
bootstrap();
