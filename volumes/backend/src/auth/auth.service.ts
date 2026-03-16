import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, contasenaPlana: string) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { email: email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password_hash, ...datosUsuario } = usuario;
    return {
      mensaje: 'Autenticación exitosa',
      usuario: datosUsuario,
    };
  }
}
