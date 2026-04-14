import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExcepcionesFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 🛡️ Código P2002: Prisma detectó una violación de @unique (Dato duplicado)
    if (exception.code === 'P2002') {
      const campo = exception.meta?.target 
        ? (exception.meta.target as string[]).join(', ') 
        : 'desconocido';

      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `El registro ya existe. El dato en el campo (${campo}) debe ser único.`,
        error: 'Conflicto de Duplicidad',
      });
    }

    // 🛡️ Código P2025: Prisma detectó que no se encontró el registro (Para los Delete/Update)
    if (exception.code === 'P2025') {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'El registro que intentas modificar o eliminar no existe.',
        error: 'No Encontrado',
      });
    }

    // Para cualquier otro error de Prisma
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno en la base de datos.',
      error: exception.message,
    });
  }
}