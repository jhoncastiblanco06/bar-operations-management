import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// 🛡️ Importamos el tipo exacto que generó tu base de datos
import { sedes } from '@prisma/client';

@Injectable()
export class SedesService {
  constructor(private prisma: PrismaService) {}

  // Le decimos que devolverá una Promesa con una 'sede' adentro
  async crear(datos: {
    nombre?: string;
    direccion?: string;
    telefono?: string;
    ciudad?: string;
    estado?: string;
  }): Promise<sedes> {
    return this.prisma.sedes.create({
      data: {
        nombre: datos.nombre || 'Sede Sin Nombre', // Evitamos nulos en campos obligatorios
        direccion: datos.direccion,
        telefono: datos.telefono,
        ciudad: datos.ciudad,
        estado: datos.estado,
      },
    });
  }

  // Devolverá una lista de sedes (sedes[])
  async obtenerTodas(): Promise<sedes[]> {
    return this.prisma.sedes.findMany({
      orderBy: { id_sede: 'asc' },
    });
  }

  async actualizar(
    id: number,
    datos: {
      nombre?: string;
      direccion?: string;
      telefono?: string;
      ciudad?: string;
      estado?: string;
    },
  ): Promise<sedes> {
    return this.prisma.sedes.update({
      where: { id_sede: id },
      data: datos,
    });
  }

  async eliminar(id: number): Promise<sedes> {
    return this.prisma.sedes.delete({
      where: { id_sede: id },
    });
  }
}
