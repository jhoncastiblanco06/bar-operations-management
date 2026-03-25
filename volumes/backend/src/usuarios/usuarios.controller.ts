import { Controller, Get, Post, Body, Param, Patch, Delete, UseInterceptors, UploadedFile, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { UsuariosService } from './usuarios.service';

const uploadDir = './uploads/avatares';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
  async crear(@Body() datos: any, @UploadedFile() file: Express.Multer.File) {
    try {
      if (file) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileName = `avatar-${uniqueSuffix}${extname(file.originalname)}`;
        const filePath = join(uploadDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        datos.avatar_url = `/uploads/avatares/${fileName}`;
      }
      return await this.usuariosService.crear(datos);
    } catch (error) {
      throw new InternalServerErrorException('Error al crear usuario', { cause: error });
    }
  }

  @Get()
  async obtenerTodos() {
    return await this.usuariosService.obtenerTodos();
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.usuariosService.obtenerPorId(Number(id));
  }

  @Patch('perfil/:id')
  @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
  async actualizarPerfil(@Param('id') id: string, @Body() datos: any, @UploadedFile() file: Express.Multer.File) {
    try {
      if (file) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileName = `avatar-${uniqueSuffix}${extname(file.originalname)}`;
        const filePath = join(uploadDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        datos.avatar_url = `/uploads/avatares/${fileName}`;
      }
      return await this.usuariosService.actualizar(Number(id), datos);
    } catch (error) {
      throw new InternalServerErrorException('Error al guardar perfil', { cause: error });
    }
  }

  // 🚀 CAMBIO CLAVE: También le ponemos el interceptor a esta ruta para que acepte FormData del Gestor de Usuarios
  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
  async actualizar(@Param('id') id: string, @Body() datos: any, @UploadedFile() file: Express.Multer.File) {
    try {
      if (file) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileName = `avatar-${uniqueSuffix}${extname(file.originalname)}`;
        const filePath = join(uploadDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        datos.avatar_url = `/uploads/avatares/${fileName}`;
      }
      return await this.usuariosService.actualizar(Number(id), datos);
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar usuario', { cause: error });
    }
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.usuariosService.eliminar(Number(id));
  }
}