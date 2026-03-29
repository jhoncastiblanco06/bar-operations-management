import { Test, TestingModule } from '@nestjs/testing';
import { SubcategoriasService } from './subcategorias.service';

describe('SubcategoriasService', () => {
  let service: SubcategoriasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubcategoriasService],
    }).compile();

    service = module.get<SubcategoriasService>(SubcategoriasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
