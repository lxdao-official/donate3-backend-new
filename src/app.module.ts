import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './api/test/test.module';
import LoggerMiddleware from './logger/logger.middleware';

import { DonateHistory } from './database/donateHistory.entity';
import { TimedTaskModule } from './timed-task/timed-task.module';
import { DonatesModule } from './api/donates/donates.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [DonateHistory],
      synchronize: true,
    }),
    TestModule,
    ScheduleModule.forRoot(),
    TimedTaskModule,
    DonatesModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
