import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { productos } from '@prisma/client';

export interface DatosProducto {
  nombre?: string;
  id_categoria?: string | number;
  id_subcategoria?: string | number; // 👈 AÑADIDO
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
        id_subcategoria: datos.id_subcategoria ? Number(datos.id_subcategoria) : null, // 👈 AÑADIDO
        costo_compra: Number(datos.costo_compra),
        precio_venta: Number(datos.precio_venta),
        estado: datos.estado || 'Activo',
        imagen_url: rutaImagen,
      },
      include: { categorias: true, subcategorias: true } // 👈 AÑADIDO PARA TRAER LA INFO COMPLETA
    });
  }

  async obtenerTodos(): Promise<productos[]> {
    return this.prisma.productos.findMany({
      orderBy: { id_producto: 'desc' },
      include: { categorias: true, subcategorias: true }, // 👈 AÑADIDO
    });
  }

  async actualizar(id: number, datos: DatosProducto, rutaImagen: string | null): Promise<productos> {
    const dataAActualizar: any = {};

    if (datos.nombre) dataAActualizar.nombre = datos.nombre;
    if (datos.codigo_sku) dataAActualizar.codigo_sku = datos.codigo_sku;
    if (datos.id_categoria) dataAActualizar.id_categoria = Number(datos.id_categoria);
    
    // 👈 AÑADIDO
    if (datos.id_subcategoria) {
      dataAActualizar.id_subcategoria = Number(datos.id_subcategoria);
    } else if (datos.id_subcategoria === null || datos.id_subcategoria === "") {
      dataAActualizar.id_subcategoria = null; // Permite quitarle la subcategoría
    }

    if (datos.costo_compra) dataAActualizar.costo_compra = Number(datos.costo_compra);
    if (datos.precio_venta) dataAActualizar.precio_venta = Number(datos.precio_venta);
    if (datos.estado) dataAActualizar.estado = datos.estado;
    
    if (rutaImagen) {
      dataAActualizar.imagen_url = rutaImagen;
    }

    return this.prisma.productos.update({
      where: { id_producto: id },
      data: dataAActualizar,
      include: { categorias: true, subcategorias: true }
    });
  }

  async eliminar(id: number): Promise<productos> {
    return this.prisma.productos.delete({
      where: { id_producto: id },
    });
  }
}