import { Module } from '@nestjs/common';
import { DonatesService } from './donates.service';
import { DonatesController } from './donates.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [PrismaModule],
  controllers: [DonatesController],
  providers: [DonatesService, ConfigService],
  exports: [DonatesService],
})
export class DonatesModule {}
