import { Controller, Get, Post, Body, Param, Patch, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductosService, DatosProducto } from './productos.service';
import { productos } from '@prisma/client';

const configuracionMulter = {
  storage: diskStorage({
    destination: './uploads/productos',
    filename: (req, file, callback) => {
      const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = extname(file.originalname);
      callback(null, `prod-${nombreUnico}${extension}`);
    },
  }),
  fileFilter: (req: any, file: any, callback: any) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return callback(new BadRequestException('Solo imágenes'), false);
    }
    callback(null, true);
  },
};

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen', configuracionMulter))
  crear(@Body() datosProducto: DatosProducto, @UploadedFile() archivo: Express.Multer.File): Promise<productos> {
    const rutaImagen = archivo ? `/uploads/productos/${archivo.filename}` : null;
    return this.productosService.crear(datosProducto, rutaImagen);
  }

  @Get()
  obtenerTodos(): Promise<productos[]> {
    return this.productosService.obtenerTodos();
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('imagen', configuracionMulter))
  actualizar(@Param('id') id: string, @Body() datosProducto: DatosProducto, @UploadedFile() archivo?: Express.Multer.File): Promise<productos> {
    const rutaImagen = archivo ? `/uploads/productos/${archivo.filename}` : null;
    return this.productosService.actualizar(Number(id), datosProducto, rutaImagen);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string): Promise<productos> {
    return this.productosService.eliminar(Number(id));
  }
}