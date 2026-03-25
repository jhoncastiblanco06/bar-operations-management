import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { SedesService } from './sedes.service';
// 🛡️ También lo importamos aquí
import { sedes } from '@prisma/client';

type DatosSede = {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
  estado?: string;
};

@Controller('sedes')
export class SedesController {
  constructor(private readonly sedesService: SedesService) {}

  @Post()
  async crear(@Body() datos: DatosSede): Promise<sedes> {
    return this.sedesService.crear(datos);
  }

  @Get()
  async obtenerTodas(): Promise<sedes[]> {
    return this.sedesService.obtenerTodas();
  }

  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() datos: DatosSede,
  ): Promise<sedes> {
    return this.sedesService.actualizar(Number(id), datos);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string): Promise<sedes> {
    return this.sedesService.eliminar(Number(id));
  }
}
