import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { productos } from '@prisma/client';

export interface DatosProducto {
  nombre?: string;
  id_categoria?: string | number;
  codigo_sku?: string;
  costo_compra?: string | number;
  precio_venta?: string | number;
  estado?: string;
}

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async crear(datos: DatosProducto, rutaImagen: string | null): Promise<productos> {
    return this.prisma.productos.create({
      data: {
        nombre: datos.nombre || 'Sin nombre',
        codigo_sku: datos.codigo_sku || null,
        id_categoria: Number(datos.id_categoria),
        costo_compra: Number(datos.costo_compra),
        precio_venta: Number(datos.precio_venta),
        estado: datos.estado || 'Activo',
        imagen_url: rutaImagen,
      },
      include: { categorias: true } // Para que devuelva la categoría de una vez
    });
  }

  async obtenerTodos(): Promise<productos[]> {
    return this.prisma.productos.findMany({
      orderBy: { id_producto: 'desc' },
      include: { categorias: true },
    });
  }

  // 🛡️ NUEVO: Lógica de actualización
  async actualizar(id: number, datos: DatosProducto, rutaImagen: string | null): Promise<productos> {
    const dataAActualizar: any = {};

    if (datos.nombre) dataAActualizar.nombre = datos.nombre;
    if (datos.codigo_sku) dataAActualizar.codigo_sku = datos.codigo_sku;
    if (datos.id_categoria) dataAActualizar.id_categoria = Number(datos.id_categoria);
    if (datos.costo_compra) dataAActualizar.costo_compra = Number(datos.costo_compra);
    if (datos.precio_venta) dataAActualizar.precio_venta = Number(datos.precio_venta);
    if (datos.estado) dataAActualizar.estado = datos.estado;
    
    // Solo actualizamos la imagen si subió una nueva
    if (rutaImagen) {
      dataAActualizar.imagen_url = rutaImagen;
    }

    return this.prisma.productos.update({
      where: { id_producto: id },
      data: dataAActualizar,
      include: { categorias: true }
    });
  }

  // 🛡️ NUEVO: Lógica de eliminación
  async eliminar(id: number): Promise<productos> {
    return this.prisma.productos.delete({
      where: { id_producto: id },
    });
  }
}