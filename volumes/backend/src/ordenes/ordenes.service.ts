import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdenesService {
  constructor(private prisma: PrismaService) {}

  async procesarPedido(datos: any) {
    const { id_sede, id_mesa, id_mesero, productos } = datos;

    // Usamos $transaction para que si algo falla (ej. no hay stock), se cancele TODO
    return await this.prisma.$transaction(async (tx) => {
      
      // 1️⃣ BARRERA DEFINITIVA: Verificamos el stock de cada producto
      for (const item of productos) {
        const inventario = await tx.inventario_sedes.findUnique({
          where: {
            id_sede_id_producto: {
              id_sede: id_sede,
              id_producto: item.id_producto,
            },
          },
        });

        if (!inventario || (inventario.stock_actual ?? 0) < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para: ${item.nombre}. Quedan ${inventario?.stock_actual || 0} unidades.`
          );
        }
      }

      // 2️⃣ BUSCAR O CREAR LA CUENTA (Si la mesa ya tiene una cuenta abierta, agregamos a esa)
      let cuenta = await tx.cuentas.findFirst({
        where: { id_mesa: id_mesa, estado: 'Abierta' },
      });

      if (!cuenta) {
        cuenta = await tx.cuentas.create({
          data: {
            id_sede: id_sede,
            id_mesa: id_mesa,
            id_mesero: id_mesero,
            estado: 'Abierta',
            subtotal: 0,
            total: 0,
            impuestos: 0,
          },
        });
      }

      // 3️⃣ INSERTAR PRODUCTOS Y DESCONTAR STOCK
      let totalAgregado = 0;

      for (const item of productos) {
        const subtotalItem = item.precio_venta * item.cantidad;
        totalAgregado += subtotalItem;

        // A. Agregar a la factura (detalle)
        await tx.detalle_cuentas.create({
          data: {
            id_cuenta: cuenta.id_cuenta,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio_venta,
            subtotal: subtotalItem,
          },
        });

        // B. Descontar del inventario
        await tx.inventario_sedes.update({
          where: {
            id_sede_id_producto: {
              id_sede: id_sede,
              id_producto: item.id_producto,
            },
          },
          data: {
            stock_actual: { decrement: item.cantidad },
          },
        });
      }

      // 4️⃣ ACTUALIZAR EL TOTAL DE LA CUENTA
      const cuentaActualizada = await tx.cuentas.update({
        where: { id_cuenta: cuenta.id_cuenta },
        data: {
          subtotal: { increment: totalAgregado },
          total: { increment: totalAgregado }, // Por ahora subtotal y total son iguales
        },
      });

      // 5️⃣ CAMBIAR EL ESTADO DE LA MESA A "OCUPADA"
      await tx.mesas.update({
        where: { id_mesa: id_mesa },
        data: { estado: 'Ocupada' },
      });

      return cuentaActualizada;
    });
  }
  async obtenerCuentaActivaMesa(id_mesa: number) {
    const cuenta = await this.prisma.cuentas.findFirst({
      where: { id_mesa: id_mesa, estado: 'Abierta' },
      include: {
        // Incluimos los detalles y los cruzamos con la tabla productos para traer los nombres
        detalle_cuentas: {
          include: {
            productos: {
              select: { nombre: true, precio_venta: true }
            }
          }
        }
      }
    });

    return cuenta || null; // Retorna null si la mesa está vacía (nueva)
  }
}