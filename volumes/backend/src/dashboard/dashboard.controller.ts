import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Ruta 1: Resumen General (Todas las sedes juntas)
  @Get('resumen')
  async obtenerResumenGlobal() {
    return await this.dashboardService.obtenerResumen();
  }

  // Ruta 2: Resumen por Sede Específica
  @Get('resumen/:id_sede')
  async obtenerResumenSede(@Param('id_sede') id_sede: string) {
    return await this.dashboardService.obtenerResumen(Number(id_sede));
  }
}