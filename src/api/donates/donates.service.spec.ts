import { Test, TestingModule } from '@nestjs/testing';
import { DonatesService } from './donates.service';

describe('DonatesService', () => {
  let service: DonatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DonatesService],
    }).compile();

    service = module.get<DonatesService>(DonatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
