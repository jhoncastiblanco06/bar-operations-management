import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';

@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post('enviar')
  async enviarPedido(@Body() datos: any) {
    return await this.ordenesService.procesarPedido(datos);
  }
  
  @Get('mesa/:id_mesa/activa')
  async obtenerCuentaMesa(@Param('id_mesa') id_mesa: string) {
    return await this.ordenesService.obtenerCuentaActivaMesa(Number(id_mesa));
  }
}