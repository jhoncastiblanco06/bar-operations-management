import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubcategoriasService {
  constructor(private prisma: PrismaService) {}

  // Crear una nueva subcategoría
  async crear(datos: any) {
    return await this.prisma.subcategorias.create({
      data: {
        nombre: datos.nombre,
        id_categoria: Number(datos.id_categoria),
        estado: datos.estado || 'Activo',
      },
    });
  }

  // Obtener TODAS las subcategorías (incluyendo el nombre de su categoría padre)
  async obtenerTodas() {
    return await this.prisma.subcategorias.findMany({
      include: {
        categorias: { select: { nombre: true } },
      },
    });
  }

  // 🚀 MUY ÚTIL: Obtener subcategorías dependiendo de la categoría elegida
  async obtenerPorCategoria(id_categoria: number) {
    return await this.prisma.subcategorias.findMany({
      where: {
        id_categoria: Number(id_categoria),
        estado: 'Activo',
      },
    });
  }

  // Actualizar
  async actualizar(id_subcategoria: number, datos: any) {
    return await this.prisma.subcategorias.update({
      where: { id_subcategoria: Number(id_subcategoria) },
      data: {
        nombre: datos.nombre,
        id_categoria: datos.id_categoria ? Number(datos.id_categoria) : undefined,
        estado: datos.estado,
      },
    });
  }

  // Eliminar (Borrado lógico)
  async eliminar(id_subcategoria: number) {
    return await this.prisma.subcategorias.update({
      where: { id_subcategoria: Number(id_subcategoria) },
      data: { estado: 'Inactivo' },
    });
  }
}