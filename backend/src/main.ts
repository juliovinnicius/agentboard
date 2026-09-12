import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import type { EnvironmentVariables } from './config/env.validation.js';

const GLOBAL_PREFIX = 'api';
const SWAGGER_PATH = `${GLOBAL_PREFIX}/docs`;

function parseCorsOrigin(value: string): string | string[] {
  if (value.trim() === '*') {
    return '*';
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.enableCors({
    origin: parseCorsOrigin(config.get('CORS_ORIGIN', { infer: true })),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  const document = new DocumentBuilder()
    .setTitle('AgentBoard API')
    .setDescription('AI assisted development lab — API foundation')
    .setVersion('1.0')
    .build();

  SwaggerModule.setup(SWAGGER_PATH, app, () =>
    SwaggerModule.createDocument(app, document),
  );

  const port = config.get('PORT', { infer: true });
  await app.listen(port);

  Logger.log(
    `AgentBoard API on http://localhost:${port}/${GLOBAL_PREFIX}/v1 (docs: /${SWAGGER_PATH})`,
    'Bootstrap',
  );
}

await bootstrap();
