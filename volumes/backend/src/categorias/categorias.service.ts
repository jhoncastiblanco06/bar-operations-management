import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  async crear(datos: { nombre: string }) {
    return this.prisma.categorias.create({
      data: {
        nombre: datos.nombre,
      },
    });
  }

  async obtenerTodas() {
    return this.prisma.categorias.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async eliminar(id: number) {
    try {
      return await this.prisma.categorias.delete({
        where: { id_categoria: id },
      });
    } catch (error) {
      throw new BadRequestException('No se pudo eliminar la categoría.');
    }
  }
}