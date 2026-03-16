import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <-- Esta magia hace que Prisma esté disponible en todo el proyecto
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <-- Exportamos el servicio para que otros módulos lo usen
})
export class PrismaModule {}
