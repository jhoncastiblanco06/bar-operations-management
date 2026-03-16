import { Test, TestingModule } from '@nestjs/testing';
import { SedesService } from './sedes.service';

describe('SedesService', () => {
  let service: SedesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SedesService],
    }).compile();

    service = module.get<SedesService>(SedesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
