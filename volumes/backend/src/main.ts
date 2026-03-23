import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// 🛡️ Importamos estas dos herramientas nuevas
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // Le decimos explícitamente a NestJS que use Express por debajo
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Tu configuración para permitir que el Frontend se conecte
  app.enableCors();

  // 📸 LA MAGIA: Hacemos pública la carpeta "uploads"
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // La URL empezará con /uploads/
  });

  await app.listen(7086);
}
bootstrap();
