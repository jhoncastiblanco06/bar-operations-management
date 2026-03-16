import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    nombre_completo: string;
    email: string;
    password_hash: string;
    rol: string;
    id_sede?: number;
  }) {
    return this.prisma.usuarios.create({
      data: {
        nombre_completo: data.nombre_completo,
        email: data.email,
        password_hash: data.password_hash, // Recuerda: Fase 2 lo encriptaremos
        rol: data.rol,
        // Convertimos a número por si acaso llega como texto desde el front
        id_sede: data.id_sede ? Number(data.id_sede) : null,
      },
    });
  }

  async findAll() {
    return this.prisma.usuarios.findMany({
      orderBy: { id_usuario: 'desc' }, // Los más nuevos primero
      include: {
        sedes: true, // ✨ ¡MAGIA RELACIONAL! Trae los datos de la sede conectada
      },
    });
  }
}
