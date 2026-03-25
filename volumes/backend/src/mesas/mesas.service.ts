import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MesasService {
  constructor(private prisma: PrismaService) {}

  async crear(datos: { id_sede: number; capacidad?: number }) {
    const idSede = Number(datos.id_sede);

    const cantidadActual = await this.prisma.mesas.count({
      where: { id_sede: idSede },
    });

    const nombreGenerado = `Mesa ${cantidadActual + 1}`;

    return this.prisma.mesas.create({
      data: {
        id_sede: idSede,
        nombre_identificador: nombreGenerado,
        capacidad: datos.capacidad ? Number(datos.capacidad) : 2,
        estado: 'Disponible',
      },
    });
  }

  async obtenerTodas() {
    return this.prisma.mesas.findMany({
      orderBy: { id_sede: 'asc' },
      include: { sedes: true },
    });
  }

  async eliminar(id: number) {
    return this.prisma.mesas.delete({
      where: { id_mesa: id },
    });
  }
// Agrega esto debajo de tus otros métodos
  async obtenerPorSede(id_sede: number) {
    return this.prisma.mesas.findMany({
      where: { 
        id_sede: id_sede,
        // Opcional: Si quieres que en la caja solo salgan las disponibles
        // estado: 'Disponible' 
      },
      orderBy: { nombre_identificador: 'asc' }
    });
  }
  // Eliminar la última mesa según capacidad en una sede
  async eliminarUltimaPorCapacidad(id_sede: number, capacidad: number) {
    const ultimaMesa = await this.prisma.mesas.findFirst({
      where: {
        id_sede: Number(id_sede),
        capacidad: Number(capacidad),
      },
      orderBy: { id_mesa: 'desc' },
    });

    if (ultimaMesa) {
      return this.prisma.mesas.delete({
        where: { id_mesa: ultimaMesa.id_mesa },
      });
    }

    return null;
  }
}
