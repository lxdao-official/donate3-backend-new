import { Injectable, Logger, Query } from '@nestjs/common';
import { CreateDonateDto } from './dto/create-donate.dto';
import { UpdateDonateDto } from './dto/update-donate.dto';
import { QueryDonateDto } from './dto/query-donate.dto';
import { ethers } from 'ethers';
import { multiply } from 'lodash';
import axios from 'axios';
import { DonationRankingByUsdtDto } from './dto/donation-ranking-by-usdt.dto.ts';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import config from 'src/config';
import { SBTCardImgDto } from './dto/SBTCardImg.dto';
import * as sharp from 'sharp';
import getTemplateCard from 'src/utils/getTemplateCard';

interface OkxResponse {
  instId: string;
  instType: string;
  markPx: string;
  ts: string;
}

@Injectable()
export class DonatesService {
  private readonly logger = new Logger(DonatesService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async findDonatesList(queryInfo: QueryDonateDto) {
    const {
      from,
      tos = [],
      message,
      chainIds = [],
      tokens = [],
      uid,
      page = 0,
      size = 10,
      orderBy = [],
    } = queryInfo;
    const filterInfo: Prisma.DonationWhereInput = {
      from: from || { not: { in: [''] } },
    };
    if (uid) {
      filterInfo.uid = uid;
    }
    if (tos.length > 0) {
      filterInfo.to = { in: tos };
    }
    if (chainIds.length > 0) {
      filterInfo.chainId = { in: chainIds };
    }
    if (tokens.length > 0) {
      filterInfo.erc20 = { in: tokens };
    }
    if (message) {
      filterInfo.message = { contains: message, mode: 'insensitive' };
    }
    const where = Object.values(filterInfo).find((item) => !!item)
      ? filterInfo
      : {};
    const data = await this.findDonates({
      where,
      skip: page * size,
      take: size,
      orderBy,
    });

    const allNumber = await this.prismaService.donation.count({
      where,
    });

    const priceList = await this.getTokenPrice();
    const dataWithAmount = this.getDonateHistoryWithAmount(data, priceList);

    return { content: dataWithAmount, page, size, total: allNumber };
  }

  async findDonates(params: Prisma.DonationFindManyArgs) {
    const result = await this.prismaService.donation.findMany(params);
    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} donate`;
  }

  async updateAllDataPrice(updateDonateDto: Prisma.DonationUpdateArgs[]) {
    const updateQueue = updateDonateDto.map((item) => {
      return this.prismaService.donation.update(item);
    });
    await this.prismaService.$transaction(updateQueue);
  }

  remove(id: number) {
    return `This action removes a #${id} donate`;
  }

  async getDonationRanking(address: string, chainId: number) {
    const { TEST_CHAIN_ID } = config;
    const where: Prisma.DonationWhereInput = {
      to: address,
      chainId: {
        not: {
          in:
            this.configService.get('NODE_ENV') !== 'development'
              ? TEST_CHAIN_ID
              : [],
        },
      },
    };
    if (chainId) {
      (where.chainId as Prisma.IntFilter<'Donation'>).in = [+chainId];
    }
    const result = await this.prismaService.donation.findMany({
      where,
    });

    const donateFromAddressMap = {};
    result.forEach((donate) => {
      const donateObj = donateFromAddressMap[donate.from];
      if (donateObj) {
        donateObj.totalAmount += Number(donate.amount);
        donateFromAddressMap[donate.from] = donateObj;
        if (!donateObj.chainIds.includes(donate.chainId)) {
          donateObj.chainIds.push(donate.chainId);
        }
      } else {
        donateFromAddressMap[donate.from] = {
          address: donate.from,
          chainIds: [donate.chainId],
          totalAmount: Number(donate.amount),
        };
      }
    });

    const resultsWithRank = Object.values<{
      address: string;
      totalAmount: number;
    }>(donateFromAddressMap)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .map((i, index) => ({ ...i, top: index + 1 }));

    return resultsWithRank;
  }

  formateDataFromChainId(data: Partial<UpdateDonateDto>[]) {
    const chainIdMap = new Map<number, Partial<UpdateDonateDto>[]>();
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
    donateList: Partial<UpdateDonateDto>[],
    tokenPrice: OkxResponse[],
  ) {
    const donateWithTokenValue = donateList.map((donate) => {
      const info = tokenPrice.find((p) => p.instId === `${donate.erc20}-USDT`);
      let amount = 0;
      if (info) {
        amount = multiply(
          +info.markPx,
          Number(ethers.formatUnits(donate.money, donate.decimals || 18)),
        );
      }
      return {
        ...donate,
        amount: String(amount),
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
        ChainIdAmount.totalMoney += Number(donate.amount);
        ChainIdAmount.price = +donate.price;
        ChainIdAmount.num += Number(
          ethers.formatUnits(donate.money, donate.decimals || 18),
        );
      });
      resultTotalMoney[chainId] = ChainIdAmount;
    });
    return resultTotalMoney;
  }

  async getAllDonationAmount(address: string) {
    const allHistory = await this.findDonates({
      where: { to: address },
    });
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
    const donatorHistory = await this.prismaService.donation.findMany({
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
    const donateList = await this.prismaService.donation.findMany({
      where: { to: toAddress },
      select: { from: true, money: true, erc20: true, decimals: true },
    });

    const tokenPriceList = await this.getTokenPrice();
    const addressToTotalDonationMap = new Map<string, number>();

    donateList.forEach((donate) => {
      const tokenPrice = tokenPriceList.find(
        (p) => p.instId === `${donate.erc20}-USDT`,
      );
      const price = tokenPrice?.markPx || '0';
      const amountInUSDT = multiply(
        +price,
        Number(ethers.formatUnits(donate.money, donate.decimals || 18)),
      );

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
    return sortedRanking;
  }

  async getTotalDonationSum(address: string): Promise<number> {
    const donationRanking = await this.getDonationRankByUsdt(address);
    const totalDonationSum = donationRanking.reduce(
      (sum, entry) => sum + entry.totalDonation,
      0,
    );
    return totalDonationSum;
  }

  async getSBTCardImg(info: SBTCardImgDto) {
    const { address, id } = info;
    const donateHistory = await this.findDonates({
      where: { from: address },
    });

    const num = donateHistory.length;
    const amount = donateHistory.reduce(
      (val, i) => val + parseFloat(i.amount),
      0,
    );

    const svgStr = getTemplateCard(num, amount.toFixed(2), address);
    const roundedCorners = Buffer.from(svgStr);
    const roundedCornerResizer = await sharp(roundedCorners, {
      unlimited: true,
    })
      .png()
      .toBuffer();
    const base64String = roundedCornerResizer.toString('base64');
    return {
      image: `data:image/png;base64,${base64String}`,
      name: `Donate3 #${id}`,
      attributes: [
        {
          trait_type: 'address',
          value: address,
        },
        { trait_type: 'num', vaule: num },
        { trait_type: 'amount', value: amount },
      ],
    };
  }
}
