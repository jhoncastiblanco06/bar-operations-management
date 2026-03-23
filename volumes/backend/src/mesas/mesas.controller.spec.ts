import { Test, TestingModule } from '@nestjs/testing';
import { MesasController } from './mesas.controller';
import { MesasService } from './mesas.service';

describe('MesasController', () => {
  let controller: MesasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MesasController],
      providers: [MesasService],
    }).compile();

    controller = module.get<MesasController>(MesasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
