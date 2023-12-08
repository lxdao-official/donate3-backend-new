import { Module } from '@nestjs/common';
import { DonatesService } from './donates.service';
import { DonatesController } from './donates.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
@Module({
  imports: [],
  controllers: [DonatesController],
  providers: [DonatesService, ConfigService, PrismaService],
  exports: [DonatesService],
})
export class DonatesModule {}
