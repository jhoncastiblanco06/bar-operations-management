import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CajaService {
  constructor(private prisma: PrismaService) {}

  async procesarVenta(datos: {
    id_sede: number;
    id_mesa: number;
    id_mesero: number;
    carrito: { id_producto: number; cantidad: number; precio_venta: number }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Calcular totales
      const subtotal = datos.carrito.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);
      const impuestos = subtotal * 0.19;
      const total = subtotal + impuestos;

      // 2. Crear la cuenta (Factura general)
      const cuenta = await tx.cuentas.create({
        data: {
          id_sede: datos.id_sede,
          id_mesa: datos.id_mesa,
          id_mesero: datos.id_mesero,
          estado: 'Pagada', // Como es POS directo, se cobra de inmediato
          subtotal: subtotal,
          impuestos: impuestos,
          total: total,
          fecha_cierre: new Date(), // Se cierra de inmediato
        },
      });

      // 3. Guardar detalles y DESCONTAR STOCK
      for (const item of datos.carrito) {
        // Guardar detalle de la factura
        await tx.detalle_cuentas.create({
          data: {
            id_cuenta: cuenta.id_cuenta,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio_venta,
            subtotal: item.precio_venta * item.cantidad,
          },
        });

        // 📉 MAGIA: Descontar del inventario
        await tx.inventario_sedes.update({
          where: {
            id_sede_id_producto: {
              id_sede: datos.id_sede,
              id_producto: item.id_producto,
            },
          },
          data: {
            stock_actual: { decrement: item.cantidad }, // Resta exactamente lo que se vendió
            ultima_actualizacion: new Date(),
          },
        });
      }

      // 4. Registrar el pago en facturas (Obligatorio por tu schema)
      await tx.pagos_facturas.create({
        data: {
          id_cuenta: cuenta.id_cuenta,
          id_cajero: datos.id_mesero,
          numero_factura: `FAC-${Date.now()}`,
          metodo_pago: 'Efectivo', // Por ahora lo dejamos por defecto
          monto_recibido: total,
          total_pagado: total,
        },
      });

      return cuenta;
    });
  }
}