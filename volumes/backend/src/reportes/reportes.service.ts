import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  // 1. REPORTE DE VENTAS DETALLADAS (Para la tabla y el CSV)
  async getVentasDetalladas(inicio: string, fin: string, idSede?: string) {
    if (!inicio || !fin) {
      throw new BadRequestException('Las fechas de inicio y fin son obligatorias.');
    }

    // Ajustamos la fecha final para abarcar hasta el último segundo del día
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(`${fin}T23:59:59.999Z`);

    // 🚀 Buscamos los detalles cruzando con la tabla "cuentas" y "productos"
    const detallesVenta = await this.prisma.detalle_cuentas.findMany({
      where: {
        cuentas: {
          fecha_apertura: { gte: fechaInicio, lte: fechaFin },
          // Solo filtramos por sede si se envió el parámetro
          ...(idSede ? { id_sede: parseInt(idSede) } : {}),
        },
      },
      include: {
        productos: true,
        cuentas: {
          include: { sedes: true },
        },
      },
    });

    const mapaResultados = new Map<string, any>();

    detallesVenta.forEach((detalle) => {
      const prod = detalle.productos;
      const sede = detalle.cuentas.sedes;
      // Usamos el ID del producto y el de la sede como llave única para agrupar
      const llave = `${prod.id_producto}-${sede.id_sede}`;

      if (!mapaResultados.has(llave)) {
        mapaResultados.set(llave, {
          codigo_sku: prod.codigo_sku || `P-00${prod.id_producto}`,
          fecha_inicio: inicio,
          fecha_final: fin,
          total_vendido: 0,
          costo_producto: Number(prod.costo_compra || 0), // 👈 Toma tu nombre real de BD
          valor_venta: Number(detalle.precio_unitario || 0), // 👈 Usa el precio histórico vendido
          ganancia: 0,
          sede: sede.nombre,
        });
      }

      const item = mapaResultados.get(llave);
      item.total_vendido += detalle.cantidad;
      
      // Cálculo de ganancia neta por las unidades de esa factura
      const gananciaPorUnidad = item.valor_venta - item.costo_producto;
      item.ganancia += gananciaPorUnidad * detalle.cantidad;
    });

    return Array.from(mapaResultados.values());
  }

  // 2. REPORTE DE TRÁFICO SEMANAL (Aforo)
  async getTrafico(idSede?: string) {
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    // 🚀 Buscamos las "cuentas" abiertas en los últimos 7 días
    const cuentas = await this.prisma.cuentas.findMany({
      where: {
        fecha_apertura: { gte: hace7Dias },
        ...(idSede ? { id_sede: parseInt(idSede) } : {}),
      },
      select: { fecha_apertura: true },
    });

    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const conteoPorDia = { Lun: 0, Mar: 0, Mié: 0, Jue: 0, Vie: 0, Sáb: 0, Dom: 0 };

    let maxCuentas = 0;
    cuentas.forEach((cuenta) => {
      if (cuenta.fecha_apertura) {
        const nombreDia = diasSemana[cuenta.fecha_apertura.getDay()];
        conteoPorDia[nombreDia] += 1;
        if (conteoPorDia[nombreDia] > maxCuentas) {
          maxCuentas = conteoPorDia[nombreDia];
        }
      }
    });

    const divisor = maxCuentas > 0 ? maxCuentas : 1;
    
    return [
      { dia: 'Lun', valor: Math.round((conteoPorDia['Lun'] / divisor) * 100) },
      { dia: 'Mar', valor: Math.round((conteoPorDia['Mar'] / divisor) * 100) },
      { dia: 'Mié', valor: Math.round((conteoPorDia['Mié'] / divisor) * 100) },
      { dia: 'Jue', valor: Math.round((conteoPorDia['Jue'] / divisor) * 100) },
      { dia: 'Vie', valor: Math.round((conteoPorDia['Vie'] / divisor) * 100) },
      { dia: 'Sáb', valor: Math.round((conteoPorDia['Sáb'] / divisor) * 100) },
      { dia: 'Dom', valor: Math.round((conteoPorDia['Dom'] / divisor) * 100) },
    ];
  }

  // 3. TOP PRODUCTOS (Los más vendidos)
  async getTopProductos(idSede?: string) {
    // 🚀 Agrupamos los detalle_cuentas para ver cuál tiene más 'cantidad' sumada
    const detallesAgrupados = await this.prisma.detalle_cuentas.groupBy({
      by: ['id_producto'],
      _sum: { cantidad: true },
      where: {
        cuentas: {
          ...(idSede ? { id_sede: parseInt(idSede) } : {}),
        },
      },
      orderBy: {
        _sum: { cantidad: 'desc' },
      },
      take: 4, // Top 4
    });

    if (detallesAgrupados.length === 0) return [];

    // Traemos los nombres de esos productos ganadores
    const idsTop = detallesAgrupados.map((d) => d.id_producto);
    const productos = await this.prisma.productos.findMany({
      where: { id_producto: { in: idsTop } },
    });

    const cantidadMaxima = detallesAgrupados[0]._sum.cantidad || 1;

    return detallesAgrupados.map((detalle) => {
      const prodInfo = productos.find((p) => p.id_producto === detalle.id_producto);
      return {
        nombre: prodInfo?.nombre || 'Desconocido',
        porcentaje: Math.round(((detalle._sum.cantidad || 0) / cantidadMaxima) * 100),
      };
    });
  }
}