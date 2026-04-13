import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubcategoriasService } from './subcategorias.service';

@Controller('subcategorias')
export class SubcategoriasController {
  constructor(private readonly subcategoriasService: SubcategoriasService) {}

  @Post()
  async crear(@Body() datos: any) {
    return await this.subcategoriasService.crear(datos);
  }

  @Get()
  async obtenerTodas() {
    return await this.subcategoriasService.obtenerTodas();
  }

  @Get('categoria/:id_categoria')
  async obtenerPorCategoria(@Param('id_categoria') id_categoria: string) {
    return await this.subcategoriasService.obtenerPorCategoria(Number(id_categoria));
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() datos: any) {
    return await this.subcategoriasService.actualizar(Number(id), datos);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.subcategoriasService.eliminar(Number(id));
  }
}