import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';

import { ethers, Contract } from 'ethers';
import { DonateHistory } from 'src/database/donateHistory.entity';
import { Repository } from 'typeorm';
import config from 'src/config';

@Injectable()
export class TimedTaskService {
  private readonly logger = new Logger(TimedTaskService.name);
  private readonly provider: ethers.JsonRpcProvider;
  private readonly contract: Contract;

  constructor(
    private configService: ConfigService,
    @InjectRepository(DonateHistory)
    private donateHistory: Repository<DonateHistory>,
  ) {
    const { CONTRACT_MAP, abi, RPC_MAP } = config;
    this.provider = new ethers.JsonRpcProvider(RPC_MAP[5]);
    this.contract = new ethers.Contract(CONTRACT_MAP[5], abi, this.provider);
  }

  async getLatestData() {
    const result = await this.donateHistory.find({
      order: { blockNumber: 'DESC' },
      take: 1,
    });
    return result[0];
  }

  async getLatestBlockNumber() {
    return await this.provider.getBlockNumber();
  }

  async getBlockDonateHistory(
    from: number,
    to: number,
  ): Promise<Partial<DonateHistory>[]> {
    const transactions = await this.contract.queryFilter(
      'donateRecord',
      from,
      to,
    );

    if (transactions.length === 0) {
      return [];
    }

    const promiseData = transactions
      .map((item) => ({
        transactionHash: item.transactionHash,
        blockNumber: item.blockNumber,
      }))
      .map(async (info) => {
        const timestamp = (await this.provider.getBlock(info.blockNumber))
          .timestamp;
        const transactionInfo = await this.provider.getTransaction(
          info.transactionHash,
        );
        const newData: Partial<DonateHistory> = {
          from: transactionInfo.from,
          to: transactionInfo.to,
          blockHash: transactionInfo.blockHash,
          blockNumber: transactionInfo.blockNumber,
          money: ethers.formatEther(transactionInfo.value) + ' eth',
          transactionHash: info.transactionHash,
          timestamp: new Date(timestamp * 1000),
          chainId: transactionInfo.chainId as unknown as number,
        };
        return newData;
      });
    const result = await Promise.all(promiseData);
    return result;
  }

  @Cron('0 */5 * * * *')
  async handleCron() {
    try {
      const lastData = await this.getLatestData();

      const blockNumber = await this.getLatestBlockNumber();

      const fromBlockNumber = lastData ? lastData.blockNumber + 1 : 0;
      const toBlockNumber = blockNumber - 1;

      const data = await this.getBlockDonateHistory(
        fromBlockNumber,
        toBlockNumber,
      );

      if (data.length > 0) {
        this.donateHistory.save(data);

        this.logger.log(
          `${new Date().toString()}: blockNumber is from ${fromBlockNumber} to ${toBlockNumber}, Update donation historical data quantity: ${
            data.length
          }`,
        );
      } else {
        this.logger.log(`${new Date().toString()}: No data to update`);
      }
    } catch (e) {
      this.logger.error('update new donate history failed: ', e.message);
    }
  }
}