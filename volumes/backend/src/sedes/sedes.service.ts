import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SedesService {
  // Inyectamos nuestro PrismaService
  constructor(private prisma: PrismaService) {}

  // Crear una nueva sede
  async create(data: {
    nombre: string;
    direccion?: string;
    telefono?: string;
  }) {
    return this.prisma.sedes.create({
      data: {
        nombre: data.nombre,
        direccion: data.direccion,
        telefono: data.telefono,
      },
    });
  }

  // Traer todas las sedes
  async findAll() {
    return this.prisma.sedes.findMany({
      orderBy: { id_sede: 'asc' }, // Ordenadas por ID
    });
  }
}
