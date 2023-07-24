import { Module } from '@nestjs/common';
import { DonatesService } from './donates.service';
import { DonatesController } from './donates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonateHistory } from 'src/database/donateHistory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DonateHistory])],
  controllers: [DonatesController],
  providers: [DonatesService],
})
export class DonatesModule {}
