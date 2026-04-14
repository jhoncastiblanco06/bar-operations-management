import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, contasenaPlana: string) {
    // 1. Buscamos al usuario y le pedimos a Prisma que incluya toda la info de su sede 🚀
    const usuario = await this.prisma.usuarios.findUnique({
      where: { email: email },
      include: { sedes: true }, // 👈 ¡ESTO HACE QUE LA REGLA DEL FRONTEND FUNCIONE!
    });

    // 2. Verificamos que el usuario exista
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. 🛡️ VERIFICACIÓN DE CONTRASEÑA (¡Vital para la seguridad!)
    // Nota: Si usas encriptación (como bcrypt), aquí deberías usar bcrypt.compare()
    // Si por ahora las guardas como texto normal, la comparación es así:
    if (usuario.password_hash !== contasenaPlana) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Separamos la contraseña para NUNCA enviarla al frontend por seguridad
    const { password_hash, ...datosUsuario } = usuario;
    
    return {
      mensaje: 'Autenticación exitosa',
      usuario: datosUsuario,
    };
  }
}