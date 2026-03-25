import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InventarioService } from './inventario.service';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get('sede/:id_sede')
  async obtenerPorSede(@Param('id_sede') id_sede: string) {
    return this.inventarioService.obtenerInventarioPorSede(Number(id_sede));
  }

  // Agrega esto debajo de tus otras rutas
  @Get('pos/:id_sede')
  async obtenerInventarioPOS(@Param('id_sede') id_sede: string) {
    return this.inventarioService.obtenerInventarioPOS(Number(id_sede));
  }

  @Post('recepcion')
  async ingresarRecepcion(@Body() datos: any) {
    return this.inventarioService.ingresarRecepcion({
      id_sede: Number(datos.id_sede),
      id_producto: Number(datos.id_producto),
      cantidad_agregada: Number(datos.cantidad_agregada),
      id_usuario: Number(datos.id_usuario),
    });
  }
}