import { Module } from '@nestjs/common';
import { TimedTaskService } from './timed-task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonateHistory } from 'src/database/donateHistory.entity';
import { ConfigService } from '@nestjs/config';

const getChainId = (): number => {
  return 137;
};

@Module({
  imports: [TypeOrmModule.forFeature([DonateHistory])],
  providers: [
    TimedTaskService,
    ConfigService,
    DonateHistory,
    {
      provide: 'CHAIN_ID_137',
      useFactory: getChainId,
    },
    {
      provide: 'CHAIN_ID_80001',
      useFactory: () => 80001,
    },
    {
      provide: 'CHAIN_ID_5',
      useFactory: () => 5,
    },
  ],
  exports: [ConfigService, DonateHistory],
})
export class TimedTaskModule {}
