import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CajaService {
  constructor(private prisma: PrismaService) {}

  // 1️⃣ OBTENER LAS MESAS ROJAS (Cuentas Abiertas)
  async obtenerCuentasActivas(id_sede: number) {
    return await this.prisma.cuentas.findMany({
      where: {
        id_sede: Number(id_sede),
        estado: 'Abierta',
      },
      include: {
        mesas: { select: { nombre_identificador: true } },
        usuarios: { select: { nombre_completo: true } }, // El mesero
      },
      orderBy: { fecha_apertura: 'asc' }, // Las más antiguas primero
    });
  }

  // 2️⃣ PROCESAR EL PAGO Y LIBERAR LA MESA
  async cobrarCuenta(datos: any) {
    const { id_cuenta, id_mesa, id_cajero, metodo_pago, monto_recibido, total_pagado } = datos;

    return await this.prisma.$transaction(async (tx) => {
      // A. Verificamos que la cuenta exista y siga abierta
      const cuenta = await tx.cuentas.findUnique({ where: { id_cuenta } });
      if (!cuenta || cuenta.estado !== 'Abierta') {
        throw new BadRequestException('La cuenta no existe o ya fue cerrada por otro cajero.');
      }

      // Calculamos el cambio y generamos un número de factura único
      const cambio_devuelto = Number(monto_recibido) - Number(total_pagado);
      const numero_factura = `FAC-${Date.now()}-${id_cuenta}`;

      // B. Registramos el ingreso de dinero en pagos_facturas
      await tx.pagos_facturas.create({
        data: {
          id_cuenta,
          id_cajero,
          numero_factura,
          metodo_pago,
          monto_recibido,
          cambio_devuelto: cambio_devuelto > 0 ? cambio_devuelto : 0,
          total_pagado,
        },
      });

      // C. Cerramos la cuenta
      await tx.cuentas.update({
        where: { id_cuenta },
        data: {
          estado: 'Cerrada',
          fecha_cierre: new Date(),
        },
      });

      // D. ¡MAGIA! Liberamos la mesa (La volvemos verde para el mesero)
      await tx.mesas.update({
        where: { id_mesa },
        data: { estado: 'Disponible' },
      });

      return { mensaje: 'Cobro exitoso', numero_factura };
    });
  }
}