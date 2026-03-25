import { Module } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // 👈 Importante para usar this.prisma
  controllers: [InventarioController],
  providers: [InventarioService],
})
export class InventarioModule {}