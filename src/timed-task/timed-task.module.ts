import { Module } from '@nestjs/common';
import { TimedTaskService } from './timed-task.service';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DonatesModule } from 'src/api/donates/donates.module';
import { DonatesService } from 'src/api/donates/donates.service';
import { HttpModule, HttpService } from '@nestjs/axios';

const getChainId = (): number => {
  return 137;
};

@Module({
  imports: [PrismaModule, HttpModule],
  providers: [
    TimedTaskService,
    ConfigService,
    DonatesService,
    // HttpService,
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
  exports: [ConfigService],
})
export class TimedTaskModule {}
