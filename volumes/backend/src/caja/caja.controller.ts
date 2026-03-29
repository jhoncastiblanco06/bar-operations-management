import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CajaService } from './caja.service';

@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Get('cuentas-activas/:id_sede')
  async obtenerCuentasActivas(@Param('id_sede') id_sede: string) {
    return await this.cajaService.obtenerCuentasActivas(Number(id_sede));
  }

  @Post('cobrar')
  async cobrarCuenta(@Body() datos: any) {
    return await this.cajaService.cobrarCuenta(datos);
  }
}