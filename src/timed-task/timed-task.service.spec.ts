import { Test, TestingModule } from '@nestjs/testing';
import { TimedTaskService } from './timed-task.service';

describe('TimedTaskService', () => {
  let service: TimedTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimedTaskService],
    }).compile();

    service = module.get<TimedTaskService>(TimedTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
