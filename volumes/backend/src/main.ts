import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //Habilitar CORS para que el frontend pueda hacer peticiones
  app.enableCors();
  //Que puerto esfcuchar y en que ip para el contenedor
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
