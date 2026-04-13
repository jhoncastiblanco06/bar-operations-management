import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubcategoriasService {
  constructor(private prisma: PrismaService) {}

  async crear(datos: any) {
    return await this.prisma.subcategorias.create({
      data: {
        nombre: datos.nombre,
        id_categoria: Number(datos.id_categoria),
        estado: datos.estado || 'Activo',
      },
    });
  }

  async obtenerTodas() {
    return await this.prisma.subcategorias.findMany({
      include: {
        categorias: { select: { nombre: true } },
      },
    });
  }

  async obtenerPorCategoria(id_categoria: number) {
    return await this.prisma.subcategorias.findMany({
      where: {
        id_categoria: Number(id_categoria),
        estado: 'Activo',
      },
    });
  }

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

  // 🔥 AQUÍ ESTABA EL ERROR: Ahora sí borra físicamente
  async eliminar(id_subcategoria: number) {
    try {
      return await this.prisma.subcategorias.delete({
        where: { id_subcategoria: Number(id_subcategoria) },
      });
    } catch (error) {
      throw new BadRequestException('No se pudo eliminar la subcategoría.');
    }
  }
}