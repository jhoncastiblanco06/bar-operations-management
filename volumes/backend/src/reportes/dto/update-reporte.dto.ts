import { PartialType } from '@nestjs/mapped-types';
import { CreateReporteDto } from './create-reporte.dto';

export class UpdateReporteDto extends PartialType(CreateReporteDto) {}
