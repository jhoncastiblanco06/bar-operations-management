import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permitimos que el Frontend se comunique con el Backend sin bloqueos
  app.enableCors();

  // Escuchamos en todas las interfaces de red (vital para Docker)
  await app.listen(3000, '0.0.0.0');
}
bootstrap();