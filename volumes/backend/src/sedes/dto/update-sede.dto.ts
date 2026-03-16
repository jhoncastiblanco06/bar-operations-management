import { PartialType } from '@nestjs/mapped-types';
import { CreateSedeDto } from './create-sede.dto';

export class UpdateSedeDto extends PartialType(CreateSedeDto) {}
