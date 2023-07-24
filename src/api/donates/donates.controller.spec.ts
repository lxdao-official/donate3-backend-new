import { Test, TestingModule } from '@nestjs/testing';
import { DonatesController } from './donates.controller';
import { DonatesService } from './donates.service';

describe('DonatesController', () => {
  let controller: DonatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonatesController],
      providers: [DonatesService],
    }).compile();

    controller = module.get<DonatesController>(DonatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
