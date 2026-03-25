import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { MesasService } from './mesas.service';

@Controller('mesas')
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Get()
  obtenerTodas() {
    return this.mesasService.obtenerTodas();
  }

  // Agrega esto junto a tus otros @Get
  @Get('sede/:id_sede')
  async obtenerPorSede(@Param('id_sede') id_sede: string) {
    return this.mesasService.obtenerPorSede(Number(id_sede));
  }

  @Post()
  crear(@Body() datos: { id_sede: string | number; capacidad: number }) {
    // 👇 AQUÍ ESTÁ LA MAGIA: Forzamos a que sean números antes de enviarlos al servicio
    return this.mesasService.crear({
      id_sede: Number(datos.id_sede),
      capacidad: Number(datos.capacidad),
    });
  }

  @Delete('sede/:idSede/capacidad/:capacidad')
  eliminarPorCapacidad(
    @Param('idSede') idSede: string,
    @Param('capacidad') capacidad: string,
  ) {
    return this.mesasService.eliminarUltimaPorCapacidad(
      Number(idSede),
      Number(capacidad),
    );
  }
}
