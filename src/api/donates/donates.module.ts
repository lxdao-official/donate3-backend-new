import { Module } from '@nestjs/common';
import { DonatesService } from './donates.service';
import { DonatesController } from './donates.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [DonatesController],
  providers: [DonatesService],
  exports: [DonatesService],
})
export class DonatesModule {}
