import { Module } from '@nestjs/common';
import { TimedTaskService } from './timed-task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonateHistory } from 'src/database/donateHistory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DonateHistory])],
  providers: [TimedTaskService],
})
export class TimedTaskModule {}
