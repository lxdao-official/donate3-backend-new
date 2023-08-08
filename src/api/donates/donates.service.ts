import { DonateHistory } from 'src/database/donateHistory.entity';
import { Injectable, Logger } from '@nestjs/common';
import { CreateDonateDto } from './dto/create-donate.dto';
import { UpdateDonateDto } from './dto/update-donate.dto';
import { QueryDonateDto } from './dto/query-donate.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOperator } from 'typeorm';
import { ethers } from 'ethers';
import { add, multiply } from 'lodash';
import axios from 'axios';
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

  formateDataFromChainId(data: DonateHistory[]) {
    const chainIdMap = new Map<number, DonateHistory[]>();
    data.forEach((info) => {
      const chainId = info.chainId;
      if (chainIdMap.get(chainId)) {
        const arr = chainIdMap.get(chainId);
        arr.push(info);
        chainIdMap.set(chainId, arr);
      } else {
        chainIdMap.set(chainId, [info]);
      }
    });
    return chainIdMap;
  }

  async getTokenPrice() {
    const response = await axios.get(
      'https://fapi.binance.com/fapi/v1/ticker/price',
    );
    return response.data || [];
  }

  getChainDonateToken(chainIdMap: Map<number, DonateHistory[]>) {
    const chainAmountMap = new Map<number, Map<string, number>>();
    chainIdMap.forEach((chainArr, chainId) => {
      const amountMap = new Map<string, number>();
      chainArr.forEach((info) => {
        const erc20 = info.erc20;
        const money = +ethers.formatEther(info.money);
        if (amountMap.get(erc20)) {
          const amount = amountMap.get(erc20);
          amountMap.set(erc20, add(amount, money));
        } else {
          amountMap.set(erc20, money);
        }
      });
      chainAmountMap.set(chainId, amountMap);
    });
    return chainAmountMap;
  }

  getTokenAmount(amountMap, priceList) {
    const resultTotalMoney = [];
    amountMap.forEach((amount, key) => {
      const info = priceList.find((p) => p.symbol === `${key}USDT`);
      const price = info?.price || 0;
      let totalMoney = 0;
      if (price) {
        totalMoney = multiply(amount, +price);
      }
      resultTotalMoney.push({ token: key, totalMoney, price, num: amount });
    });
    return resultTotalMoney;
  }

  async getAllDonationAmount(address: string) {
    const allHistory = await this.findDonatesFromAddress({ address });
    const chainIdMap = this.formateDataFromChainId(allHistory);
    const priceList = await this.getTokenPrice();
    const chainAmountMap = this.getChainDonateToken(chainIdMap);
    const resultTotalMoney = {};
    chainAmountMap.forEach((amountMap, chainId) => {
      const amountArr = this.getTokenAmount(amountMap, priceList);
      resultTotalMoney[chainId] = amountArr;
    });
    return resultTotalMoney;
  }
}
