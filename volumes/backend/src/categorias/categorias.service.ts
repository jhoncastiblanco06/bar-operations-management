import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  async crear(datos: { nombre: string }) {
    // Usamos exactamente el modelo de tu schema
    return this.prisma.categorias.create({
      data: {
        nombre: datos.nombre,
        // Nota: 'descripcion' es opcional en tu schema, así que podemos omitirlo por ahora
      },
    });
  }

  async obtenerTodas() {
    return this.prisma.categorias.findMany({
      orderBy: { nombre: 'asc' },
    });
  }
}
