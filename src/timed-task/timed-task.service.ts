import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';

import { ethers, Contract, EventLog } from 'ethers';
import { DonateHistory } from 'src/database/donateHistory.entity';
import { Repository } from 'typeorm';
import config from 'src/config';

@Injectable()
export class TimedTaskService {
  private readonly logger = new Logger(TimedTaskService.name);
  private chainIds: number[];
  private providerContracts: {
    [chainId: number]: { provider: ethers.JsonRpcProvider; contract: Contract };
  };

  constructor(
    private configService: ConfigService,
    @InjectRepository(DonateHistory)
    private donateHistory: Repository<DonateHistory>,
  ) {
    const { CONTRACT_MAP, abi, RPC_MAP } = config;
    this.chainIds = [5, 80001, 137];
    this.providerContracts = {};
    for (const chainId of this.chainIds) {
      if (CONTRACT_MAP[chainId] && RPC_MAP[chainId]) {
        const provider = new ethers.JsonRpcProvider(RPC_MAP[chainId]);
        const contract = new ethers.Contract(
          CONTRACT_MAP[chainId],
          abi,
          provider,
        );
        this.providerContracts[chainId] = { provider, contract };
      }
    }
  }

  private async getProviderAndContract(chainId: number) {
    const { CONTRACT_MAP, abi, RPC_MAP } = config;
    const provider = new ethers.JsonRpcProvider(RPC_MAP[chainId]);
    const contract = new ethers.Contract(CONTRACT_MAP[chainId], abi, provider);
    return { provider, contract };
  }

  async getLatestData(chainId: number) {
    const result = await this.donateHistory.find({
      where: { chainId },
      order: { blockNumber: 'DESC' },
      take: 1,
    });
    return result[0];
  }

  async getBlockDonateHistory(
    chainId: number,
    from: number,
    to: number,
    contract: Contract,
    provider: ethers.JsonRpcProvider,
  ): Promise<Partial<DonateHistory>[]> {
    const { provider: usedProvider, contract: usedContract } =
      await this.getProviderAndContract(chainId);
    const transactions = await usedContract.queryFilter(
      'donateRecord',
      from,
      to,
    );

    if (transactions.length === 0) {
      return [];
    }

    const promiseData = transactions.map(async (item: EventLog) => {
      const timestamp = (await usedProvider.getBlock(item.blockNumber))
        .timestamp;
      const transactionInfo = await usedProvider.getTransaction(
        item.transactionHash,
      );

      const [from, to, symbol, amount, msg] = item.args;

      const newData: Partial<DonateHistory> = {
        from,
        to,
        blockHash: item.blockHash,
        blockNumber: item.blockNumber,
        money: amount,
        transactionHash: item.transactionHash,
        timestamp: new Date(timestamp * 1000),
        chainId: transactionInfo.chainId as unknown as number,
        message: ethers.toUtf8String(msg),
        erc20: ethers.decodeBytes32String(symbol),
      };

      return newData;
    });
    const result = await Promise.all(promiseData);
    return result;
  }

  async handleChain(chainId: number) {
    const { provider, contract } = await this.getProviderAndContract(chainId);
    const lastData = await this.getLatestData(chainId);
    const blockNumber = await provider.getBlockNumber();
    const fromBlockNumber = lastData ? lastData.blockNumber + 1 : 0;
    const toBlockNumber = blockNumber - 1;

    const data = await this.getBlockDonateHistory(
      chainId,
      fromBlockNumber,
      toBlockNumber,
      contract,
      provider,
    );

    if (data.length > 0) {
      await this.donateHistory.save(data);

      this.logger.log(
        `${new Date().toString()}: blockNumber is from ${fromBlockNumber} to ${toBlockNumber}, Update donation historical data quantity: ${
          data.length
        }`,
      );
    } else {
      this.logger.log(`${new Date().toString()}: No data to update`);
    }
  }
  @Cron('0 */1 * * * *')
  async handleCron() {
    try {
      for (const chainId of this.chainIds) {
        await this.handleChain(chainId);
      }
    } catch (e) {
      this.logger.error('update new donate history failed: ', e.message);
    }
  }
}
