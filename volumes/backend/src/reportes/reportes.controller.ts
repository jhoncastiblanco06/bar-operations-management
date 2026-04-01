import { Controller, Get, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('ventas-detalladas')
  async obtenerVentasDetalladas(
    @Query('inicio') inicio: string,
    @Query('fin') fin: string,
    @Query('sede') sede?: string,
  ) {
    return this.reportesService.getVentasDetalladas(inicio, fin, sede);
  }

  @Get('trafico')
  async obtenerTrafico(@Query('sede') sede?: string) {
    return this.reportesService.getTrafico(sede);
  }

  @Get('top-productos')
  async obtenerTopProductos(@Query('sede') sede?: string) {
    return this.reportesService.getTopProductos(sede);
  }
}