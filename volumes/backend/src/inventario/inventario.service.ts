import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  // Obtener stock actual de una sede
  async obtenerInventarioPorSede(id_sede: number) {
    return this.prisma.inventario_sedes.findMany({
      where: { id_sede },
    });
  }

  // Este método fusiona el inventario con los datos del producto
  async obtenerInventarioPOS(id_sede: number) {
    const inventario = await this.prisma.inventario_sedes.findMany({
      where: { id_sede: id_sede },
      include: { 
        productos: true // ✨ Traemos toda la info del producto maestro
      },
    });

    // Transformamos los datos para que el Frontend los lea fácilmente
    // Fusionamos la info del producto con su stock actual
    return inventario.map(item => {
      return {
        ...item.productos, // Extrae id, nombre, precio, imagen...
        stock_actual: item.stock_actual, // Le inyectamos el stock
      };
    });
  }

  // Lógica de Recepción de Mercancía
  async ingresarRecepcion(datos: {
    id_sede: number;
    id_producto: number;
    cantidad_agregada: number;
    id_usuario: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Upsert del stock (Actualiza si existe, crea si no)
      const inventario = await tx.inventario_sedes.upsert({
        where: {
          id_sede_id_producto: {
            id_sede: datos.id_sede,
            id_producto: datos.id_producto,
          },
        },
        update: {
          stock_actual: { increment: datos.cantidad_agregada },
          ultima_actualizacion: new Date(),
        },
        create: {
          id_sede: datos.id_sede,
          id_producto: datos.id_producto,
          stock_actual: datos.cantidad_agregada,
        },
      });

      // 2. Registrar en el historial para auditoría
      await tx.historial_ingresos_stock.create({
        data: {
          id_inventario: inventario.id_inventario,
          id_usuario: datos.id_usuario,
          cantidad_agregada: datos.cantidad_agregada,
        },
      });

      return inventario;
    });
  }
}