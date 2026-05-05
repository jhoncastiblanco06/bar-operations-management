import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client'; // 👈 ¡SI FALTA ESTA LÍNEA, HAY ERROR 500!🚀 IMPORTANTE: Para leer los errores de Prisma

@Injectable()
export class MesasService {
  constructor(private prisma: PrismaService) {}

  async crear(datos: { id_sede: number; capacidad?: number }) {
    const idSede = Number(datos.id_sede);

    // Contamos todas las mesas (incluso las inactivas) para que el número de mesa nunca se repita
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
      // 🚀 Solo mostramos las que no estén Inactivas
      where: { estado: { not: 'Inactiva' } },
      orderBy: { id_sede: 'asc' },
      include: { sedes: true },
    });
  }

  // 🚀 BORRADO INTELIGENTE PARA MESAS INDIVIDUALES
  async eliminar(id: number) {
    try {
      // 1. Intentamos el borrado físico (Por si la mesa es nueva y no tiene facturas)
      return await this.prisma.mesas.delete({
        where: { id_mesa: id },
      });
    } catch (error) {
      // 2. Si choca con el historial (P2003), hacemos un borrado lógico
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return await this.prisma.mesas.update({
          where: { id_mesa: id },
          data: { estado: 'Inactiva' },
        });
      }
      throw error; // Si es otro error, lo dejamos pasar al Escudo Global
    }
  }

  async obtenerPorSede(id_sede: number) {
    return this.prisma.mesas.findMany({
      where: { 
        id_sede: Number(id_sede),
        estado: { not: 'Inactiva' } // 🚀 Jamás le enviamos mesas fantasma al cajero/mesero
      },
      orderBy: { nombre_identificador: 'asc' }
    });
  }

  // 🚀 BORRADO INTELIGENTE PARA EL BOTÓN DE DISMINUIR CAPACIDAD
  async eliminarUltimaPorCapacidad(id_sede: number, capacidad: number) {
    // Solo buscamos entre las mesas que realmente existen y están activas
    const ultimaMesa = await this.prisma.mesas.findFirst({
      where: {
        id_sede: Number(id_sede),
        capacidad: Number(capacidad),
        estado: { not: 'Inactiva' }, 
      },
      orderBy: { id_mesa: 'desc' },
    });

    if (!ultimaMesa) return null;

    try {
      // 1. Intentamos borrado físico
      return await this.prisma.mesas.delete({
        where: { id_mesa: ultimaMesa.id_mesa },
      });
    } catch (error) {
      // 2. Si tiene facturas, hacemos borrado lógico y la volvemos "fantasma"
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return await this.prisma.mesas.update({
          where: { id_mesa: ultimaMesa.id_mesa },
          data: { estado: 'Inactiva' },
        });
      }
      throw error;
    }
  }
}