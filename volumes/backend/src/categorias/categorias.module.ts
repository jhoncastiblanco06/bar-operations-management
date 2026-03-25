import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 👈 ¡ESTA ES LA CLAVE!

@Module({
  imports: [PrismaModule], // 👈 Y ESTO TAMBIÉN
  controllers: [CategoriasController],
  providers: [CategoriasService],
})
export class CategoriasModule {}
