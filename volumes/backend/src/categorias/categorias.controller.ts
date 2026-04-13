import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CategoriasService } from './categorias.service';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  crear(@Body() datos: { nombre: string }) {
    return this.categoriasService.crear(datos);
  }

  @Get()
  obtenerTodas() {
    return this.categoriasService.obtenerTodas();
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.categoriasService.eliminar(Number(id));
  }
}