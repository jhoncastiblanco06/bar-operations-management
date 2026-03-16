import { Controller, Get, Post, Body } from '@nestjs/common';
import { SedesService } from './sedes.service';

@Controller('sedes')
export class SedesController {
  constructor(private readonly sedesService: SedesService) {}

  @Post()
  create(
    @Body()
    createSedeDto: {
      nombre: string;
      direccion?: string;
      telefono?: string;
    },
  ) {
    return this.sedesService.create(createSedeDto);
  }

  @Get()
  findAll() {
    return this.sedesService.findAll();
  }
}
