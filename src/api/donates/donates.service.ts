import { DonateHistory } from 'src/database/donateHistory.entity';
import { Injectable, Logger } from '@nestjs/common';
import { CreateDonateDto } from './dto/create-donate.dto';
import { UpdateDonateDto } from './dto/update-donate.dto';
import { QueryDonateDto } from './dto/query-donate.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOperator } from 'typeorm';
@Injectable()
export class DonatesService {
  private readonly logger = new Logger(DonatesService.name);

  constructor(
    @InjectRepository(DonateHistory)
    private donateHistory: Repository<DonateHistory>,
  ) {}

  create(createDonateDto: CreateDonateDto) {
    return 'This action adds a new donate';
  }

  async findDonatesFromAddress(params: QueryDonateDto) {
    const result = await this.donateHistory.find({
      where: { to: params.address },
    });
    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} donate`;
  }

  update(id: number, updateDonateDto: UpdateDonateDto) {
    return `This action updates a #${id} donate`;
  }

  remove(id: number) {
    return `This action removes a #${id} donate`;
  }

  async getDonationRanking(address: string, chainId: number) {
    const queryBuilder = this.donateHistory.createQueryBuilder('donate');

    const result = await queryBuilder
      .select('donate.from', 'address')
      .addSelect('SUM(CAST(donate.money AS numeric))', 'totaldonation')
      .where('donate.to = :address', { address })
      .andWhere('donate.chainId = :chainId', { chainId })
      .andWhere('donate.money IS NOT NULL')
      .groupBy('donate.from')
      .orderBy('totaldonation', 'DESC')
      .getRawMany();
    const resultsWithRank = result.map((entry, index) => ({
      ...entry,
      top: (index + 1).toString(),
    }));

    return resultsWithRank;
  }
}
