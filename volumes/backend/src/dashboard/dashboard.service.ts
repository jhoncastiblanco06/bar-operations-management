import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async obtenerResumen(id_sede?: number) {
    // 1. Calculamos las fechas de "HOY" (Desde las 00:00:00 hasta las 23:59:59)
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    
    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    // Filtros dinámicos: Si mandan id_sede, filtramos por esa sede. Si no, suma todo (Global)
    const filtroSede = id_sede ? { id_sede: Number(id_sede) } : {};
    
    // Para las facturas, tenemos que buscar por la relación con la cuenta para saber la sede
    const filtroSedeFacturas = id_sede ? { cuentas: { id_sede: Number(id_sede) } } : {};

    // 2. Ejecutamos todas las consultas al mismo tiempo para que sea rapidísimo
    const [
      resultadoVentas,
      totalMesas,
      mesasOcupadas,
      productosBajoStock,
      personalActivo
    ] = await Promise.all([
      // A. Sumar ventas de hoy
      this.prisma.pagos_facturas.aggregate({
        _sum: { total_pagado: true },
        where: {
          fecha_pago: { gte: inicioDia, lte: finDia },
          ...filtroSedeFacturas,
        },
      }),

      // B. Contar todas las mesas
      this.prisma.mesas.count({ where: filtroSede }),

      // C. Contar mesas rojas/abiertas
      this.prisma.mesas.count({
        where: { ...filtroSede, estado: 'Ocupada' }, // Asegúrate que este sea el texto exacto de tu BD
      }),

      // D. Alerta de Inventario (Productos con 10 o menos unidades)
      this.prisma.inventario_sedes.count({
        where: { ...filtroSede, stock_actual: { lte: 10 } },
      }),

      // E. Personal Activo
      this.prisma.usuarios.count({
        where: { ...filtroSede, estado: 'Activo' },
      }),
    ]);

    // 3. Devolvemos el paquete armado al frontend
    return {
      ventasHoy: Number(resultadoVentas._sum.total_pagado) || 0,
      totalMesas,
      mesasOcupadas,
      productosBajoStock,
      personalActivo,
    };
  }
}