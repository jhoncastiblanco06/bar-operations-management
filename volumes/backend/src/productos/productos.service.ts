import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { productos } from '@prisma/client'; // 🛡️ NUEVO: Importamos el tipo exacto de tu base de datos

export interface DatosProducto {
  nombre: string;
  id_categoria: string | number;
  codigo_sku?: string;
  costo_compra: string | number;
  precio_venta: string | number;
  estado?: string;
}

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  // 🛡️ NUEVO: Le decimos que esta función promete devolver un "producto"
  async crear(
    datos: DatosProducto,
    rutaImagen: string | null,
  ): Promise<productos> {
    return this.prisma.productos.create({
      data: {
        nombre: datos.nombre,
        codigo_sku: datos.codigo_sku || null,
        id_categoria: Number(datos.id_categoria),
        costo_compra: Number(datos.costo_compra),
        precio_venta: Number(datos.precio_venta),
        estado: datos.estado || 'Activo',
        imagen_url: rutaImagen,
      },
    });
  }

  // 🛡️ NUEVO: Le decimos que esta función promete devolver un arreglo [] de "productos"
  async obtenerTodos(): Promise<productos[]> {
    return this.prisma.productos.findMany({
      orderBy: { id_producto: 'desc' },
      include: {
        categorias: true,
      },
    });
  }
}
