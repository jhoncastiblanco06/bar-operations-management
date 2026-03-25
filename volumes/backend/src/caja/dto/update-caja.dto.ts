import { PartialType } from '@nestjs/mapped-types';
import { CreateCajaDto } from './create-caja.dto';

export class UpdateCajaDto extends PartialType(CreateCajaDto) {}
