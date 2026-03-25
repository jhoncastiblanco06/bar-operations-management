import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { usuarios } from '@prisma/client';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async crear(datos: any): Promise<usuarios> {
    const dataLimpia = { ...datos };

    // 🚀 CAMBIO CLAVE: Comprobación estricta para evitar que "null" se convierta en 0
    if (dataLimpia.id_sede === 'null' || dataLimpia.id_sede === '' || dataLimpia.id_sede === undefined || dataLimpia.id_sede === null) {
       dataLimpia.id_sede = null;
    } else {
       dataLimpia.id_sede = Number(dataLimpia.id_sede);
    }

    delete dataLimpia.avatar;

    try {
      return await this.prisma.usuarios.create({
        data: {
          nombre_completo: dataLimpia.nombre_completo,
          email: dataLimpia.email,
          password_hash: dataLimpia.password_hash, 
          rol: dataLimpia.rol,
          estado: dataLimpia.estado || 'Activo',
          id_sede: dataLimpia.id_sede,
          avatar_url: dataLimpia.avatar_url,
        },
        include: { sedes: true }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('El correo electrónico ya está registrado.');
      }
      throw error;
    }
  }

  async obtenerTodos(): Promise<usuarios[]> {
    return this.prisma.usuarios.findMany({
      orderBy: { id_usuario: 'desc' },
      include: { sedes: true },
    });
  }

  async obtenerPorId(id: number): Promise<usuarios> {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario: id },
      include: { sedes: true },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async actualizar(id: number, datos: any): Promise<usuarios> {
    const dataTransformada: any = { ...datos };

    // 🚀 Comprobación estricta aquí también
    if (dataTransformada.id_sede !== undefined) {
      if (dataTransformada.id_sede === 'null' || dataTransformada.id_sede === '' || dataTransformada.id_sede === null) {
         dataTransformada.id_sede = null;
      } else {
         dataTransformada.id_sede = Number(dataTransformada.id_sede);
      }
    }

    delete dataTransformada.avatar; 

    return this.prisma.usuarios.update({
      where: { id_usuario: id },
      data: dataTransformada,
      include: { sedes: true }
    });
  }

  async eliminar(id: number): Promise<usuarios> {
    return this.prisma.usuarios.delete({
      where: { id_usuario: id }
    });
  }
}