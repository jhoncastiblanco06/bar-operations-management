import { Controller, Get, Post, Body } from '@nestjs/common';
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
}
