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
import { DonationRankingByUsdtDto } from './dto/donation-ranking-by-usdt.dto.ts';

interface OkxResponse {
  instId: string;
  instType: string;
  markPx: string;
  ts: string;
}

export interface DonateInfoWithAmount extends DonateHistory {
  amount: number;
  price: string;
}

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

  formateDataFromChainId(data: DonateInfoWithAmount[]) {
    const chainIdMap = new Map<number, DonateInfoWithAmount[]>();
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

  async getTokenPrice(): Promise<OkxResponse[]> {
    try {
      const result = await axios.get(
        'https://www.okx.com/api/v5/public/mark-price?instType=MARGIN',
      );
      if (result.status === 200) {
        return result.data.data;
      } else {
        return [];
      }
    } catch (e) {
      this.logger.error(
        `${new Date().toDateString()} ${DonatesService.name}: ${
          e.response.status
        } errorCode: ${e.response.data.code}  msg: ${e.response.data.msg}`,
      );
    }
  }

  getDonateHistoryWithAmount(
    donateList: DonateHistory[],
    tokenPrice: OkxResponse[],
  ): DonateInfoWithAmount[] {
    const donateWithTokenValue = donateList.map((donate) => {
      const info = tokenPrice.find((p) => p.instId === `${donate.erc20}-USDT`);
      let amount = 0;
      if (info) {
        amount = multiply(+info.markPx, +ethers.formatEther(donate.money));
      }
      return {
        ...donate,
        amount,
        price: info?.markPx || '0',
      };
    });
    return donateWithTokenValue;
  }

  getResultTotalMoney(chainIdMap) {
    const resultTotalMoney = {};
    chainIdMap.forEach((donateList, chainId) => {
      const ChainIdAmount = { token: '', totalMoney: 0, price: 0, num: 0 };
      donateList.forEach((donate) => {
        ChainIdAmount.token = donate.erc20;
        ChainIdAmount.totalMoney += donate.amount;
        ChainIdAmount.price = +donate.price;
        ChainIdAmount.num += +ethers.formatEther(donate.money);
      });
      resultTotalMoney[chainId] = ChainIdAmount;
    });
    return resultTotalMoney;
  }

  async getAllDonationAmount(address: string) {
    const allHistory = await this.findDonatesFromAddress({ address });
    const priceList = await this.getTokenPrice();
    const allHistoryWithAmount = this.getDonateHistoryWithAmount(
      allHistory,
      priceList,
    );

    const chainIdMap = this.formateDataFromChainId(allHistoryWithAmount);
    const resultTotalMoney = this.getResultTotalMoney(chainIdMap);

    return resultTotalMoney;
  }

  async getAllDonatorHistory(address: string) {
    const priceList = await this.getTokenPrice();
    const donatorHistory = await this.donateHistory.find({
      where: { from: address },
    });
    const donatorAmountMap = this.getDonateHistoryWithAmount(
      donatorHistory,
      priceList,
    );
    return donatorAmountMap;
  }

  async getDonationRankByUsdt(
    toAddress: string,
  ): Promise<DonationRankingByUsdtDto[]> {
    const donateList = await this.donateHistory.find({
      where: { to: toAddress },
      select: ['from', 'money', 'erc20'],
    });

    const tokenPriceList = await this.getTokenPrice();
    const addressToTotalDonationMap = new Map<string, number>();

    donateList.forEach((donate) => {
      const tokenPrice = tokenPriceList.find(
        (p) => p.instId === `${donate.erc20}-USDT`,
      );
      const price = tokenPrice?.markPx || '0';
      const amountInUSDT = multiply(+price, +ethers.formatEther(donate.money));

      if (addressToTotalDonationMap.has(donate.from)) {
        addressToTotalDonationMap.set(
          donate.from,
          addressToTotalDonationMap.get(donate.from) + amountInUSDT,
        );
      } else {
        addressToTotalDonationMap.set(donate.from, amountInUSDT);
      }
    });

    const sortedRanking = Array.from(addressToTotalDonationMap.entries())
      .map(([address, totalDonation]) => ({ address, totalDonation }))
      .sort((a, b) => b.totalDonation - a.totalDonation)
      .map((entry, index) => ({
        ...entry,
        top: (index + 1).toString(),
      }));
    const totalDonationSum = sortedRanking.reduce(
      (sum, entry) => sum + entry.totalDonation,
      0,
    );

    const rankedWithTotalSum = sortedRanking.map((entry) => ({
      ...entry,
      totalDonationSum,
    }));

    return rankedWithTotalSum;
  }
}
