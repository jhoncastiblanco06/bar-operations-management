import { Module } from '@nestjs/common';
import { CajaController } from './caja.controller';
import { CajaService } from './caja.service';

@Module({
  controllers: [CajaController],
  providers: [CajaService],
})
export class CajaModule {}