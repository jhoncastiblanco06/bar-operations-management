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
// 🛡️ Importamos el servicio y nuestro nuevo molde
import { ProductosService, DatosProducto } from './productos.service';

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
  // 🛡️ Reemplazamos 'any' por 'DatosProducto'
  crear(
    @Body() datosProducto: DatosProducto,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    const rutaImagen = archivo
      ? `/uploads/productos/${archivo.filename}`
      : null;
    return this.productosService.crear(datosProducto, rutaImagen);
  }

  @Get()
  obtenerTodos() {
    return this.productosService.obtenerTodos();
  }
}
