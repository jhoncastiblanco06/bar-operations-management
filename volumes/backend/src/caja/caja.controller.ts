import { Controller, Post, Body } from '@nestjs/common';
import { CajaService } from './caja.service';

@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Post('venta')
  async procesarVenta(@Body() datos: any) {
    return this.cajaService.procesarVenta(datos);
  }
}