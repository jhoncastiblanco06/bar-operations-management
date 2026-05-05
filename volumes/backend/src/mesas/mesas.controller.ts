import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { MesasService } from './mesas.service';

@Controller('mesas')
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Get()
  obtenerTodas() {
    return this.mesasService.obtenerTodas();
  }

  @Get('sede/:id_sede')
  async obtenerPorSede(@Param('id_sede') id_sede: string) {
    return this.mesasService.obtenerPorSede(Number(id_sede));
  }

  @Post()
  crear(@Body() datos: { id_sede: string | number; capacidad: number }) {
    return this.mesasService.crear({
      id_sede: Number(datos.id_sede),
      capacidad: Number(datos.capacidad),
    });
  }

  // Estandarizamos el Delete para que todo use 'id_sede'
  @Delete('sede/:id_sede/capacidad/:capacidad')
  eliminarPorCapacidad(
    @Param('id_sede') id_sede: string,
    @Param('capacidad') capacidad: string,
  ) {
    return this.mesasService.eliminarUltimaPorCapacidad(
      Number(id_sede),
      Number(capacidad),
    );
  }

  // Agregamos también el Delete por ID individual que faltaba
  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.mesasService.eliminar(Number(id));
  }
}