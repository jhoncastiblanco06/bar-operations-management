import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductosService, DatosProducto } from './productos.service';
import { productos } from '@prisma/client'; // 🛡️ NUEVO: Importamos el tipo exacto

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads/productos',
        filename: (req, file, callback) => {
          const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const extension = extname(file.originalname);
          callback(null, `prod-${nombreUnico}${extension}`);
        },
      }),
    }),
  )
  // 🛡️ NUEVO: Añadimos ": Promise<productos>" al final
  crear(
    @Body() datosProducto: DatosProducto,
    @UploadedFile() archivo: Express.Multer.File,
  ): Promise<productos> {
    const rutaImagen = archivo
      ? `/uploads/productos/${archivo.filename}`
      : null;
    // ¡Adiós error! Ahora TypeScript sabe que esto es seguro.
    return this.productosService.crear(datosProducto, rutaImagen);
  }

  @Get()
  // 🛡️ NUEVO: Añadimos ": Promise<productos[]>" al final
  obtenerTodos(): Promise<productos[]> {
    // ¡Adiós error!
    return this.productosService.obtenerTodos();
  }
}
