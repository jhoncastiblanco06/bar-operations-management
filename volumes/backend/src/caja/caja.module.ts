import { Module } from '@nestjs/common';
import { CajaService } from './caja.service';
import { CajaController } from './caja.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 👈 Agrega esto

@Module({
  imports: [PrismaModule], // 👈 Y esto
  controllers: [CajaController],
  providers: [CajaService],
})
export class CajaModule {}