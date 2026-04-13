import { Module } from '@nestjs/common';
import { SubcategoriasController } from './subcategorias.controller';
import { SubcategoriasService } from './subcategorias.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubcategoriasController],
  providers: [SubcategoriasService],
})
export class SubcategoriasModule {}