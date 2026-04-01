import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { PrismaModule } from '../prisma/prisma.module'; // <-- Ajusta la ruta

@Module({
  imports: [PrismaModule], // <-- MUY IMPORTANTE
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}