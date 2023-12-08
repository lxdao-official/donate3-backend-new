import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './api/test/test.module';
import LoggerMiddleware from './logger/logger.middleware';

import { TimedTaskModule } from './timed-task/timed-task.module';
import { DonatesModule } from './api/donates/donates.module';
import { PrismaModule } from './prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { SettingsModule } from './api/settings/settings.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TestModule,
    ScheduleModule.forRoot(),
    DonatesModule,
    SettingsModule,
    TimedTaskModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
