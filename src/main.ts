/**
 * The `bootstrap` function sets up a NestJS application with global prefixes, Swagger documentation,
 * validation pipes, and listens on a specified port.
 */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { SYSTEM_CONFIG_KEYS } from '@constant/common/system-config-keys';
import { ConfigService } from '@nestjs/config';
import { WinstonLogger } from '@common/logger/winston-logger.service';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { ValidationExceptionFilter } from '@common/filters/validation-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger(),
  });

  // winston logger
  const logger = app.get(WinstonLogger);
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new LoggingInterceptor(logger, reflector));

  // overriding bad request exceptions
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new ValidationExceptionFilter());

  const configService = app.get<ConfigService>(ConfigService);
  app.use(helmet());

  // global prefixes
  app.setGlobalPrefix('api');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('BPODialer')
    .setDescription('BPODialer Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);

  // Enable validation globally (DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      //forbidNonWhitelisted: true,
      // disableErrorMessages: environment.production,
    }),
  );

  // enable cors for frontend
  app.enableCors({
    origin: ['http://localhost:5173'],
  });

  const port = configService.get(SYSTEM_CONFIG_KEYS.PORT);

  await app.listen(port);

  new Logger().log(`Backend is listening on port ${port}`, 'NestApplication');
}
bootstrap();
