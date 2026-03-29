import { Test, TestingModule } from '@nestjs/testing';
import { SubcategoriasController } from './subcategorias.controller';
import { SubcategoriasService } from './subcategorias.service';

describe('SubcategoriasController', () => {
  let controller: SubcategoriasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubcategoriasController],
      providers: [SubcategoriasService],
    }).compile();

    controller = module.get<SubcategoriasController>(SubcategoriasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
