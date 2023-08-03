import { Inject, Injectable, Logger } from '@nestjs/common';
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
  private readonly provider: ethers.JsonRpcProvider;
  private readonly contract: Contract;
  private readonly provider80001: ethers.JsonRpcProvider;
  private readonly contract80001: Contract;
  private readonly provider5: ethers.JsonRpcProvider;
  private readonly contract5: Contract;
  private readonly provider137: ethers.JsonRpcProvider;
  private readonly contract137: Contract;

  constructor(
    private configService: ConfigService,
    @InjectRepository(DonateHistory)
    private donateHistory: Repository<DonateHistory>,
    @Inject('CHAIN_ID_137') private chainId137: number,
    @Inject('CHAIN_ID_80001') private chainId80001: number,
    @Inject('CHAIN_ID_5') private chainId5: number,
  ) {
    const { CONTRACT_MAP, abi, RPC_MAP } = config;
    this.provider137 = new ethers.JsonRpcProvider(RPC_MAP[this.chainId137]);
    this.provider80001 = new ethers.JsonRpcProvider(RPC_MAP[this.chainId80001]);
    this.provider5 = new ethers.JsonRpcProvider(RPC_MAP[this.chainId5]);
    this.contract137 = new ethers.Contract(
      CONTRACT_MAP[this.chainId137],
      abi,
      this.provider,
    );
    this.contract80001 = new ethers.Contract(
      CONTRACT_MAP[this.chainId80001],
      abi,
      this.provider80001,
    );
    this.contract5 = new ethers.Contract(
      CONTRACT_MAP[this.chainId5],
      abi,
      this.provider5,
    );
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
    contract?: Contract,
    provider?: ethers.JsonRpcProvider,
  ): Promise<Partial<DonateHistory>[]> {
    const usedContract = contract || this.contract;
    const usedProvider = provider || this.provider;
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

  async handleChainId80001() {
    const { CONTRACT_MAP, abi, RPC_MAP } = config;
    const provider80001 = new ethers.JsonRpcProvider(
      RPC_MAP[this.chainId80001],
    );
    const contract80001 = new ethers.Contract(
      CONTRACT_MAP[this.chainId80001],
      abi,
      provider80001,
    );

    const lastData = await this.getLatestData();
    const blockNumber = await provider80001.getBlockNumber();
    const offsetBlocks = 100;
    const fromBlockNumber = 36965194;
    // lastData
    //   ? lastData.blockNumber + 1
    //   : blockNumber - offsetBlocks;
    console.log('fromBlockNumber', fromBlockNumber);
    const toBlockNumber = blockNumber - 1;
    console.log('toBlockNumber', toBlockNumber);

    const step = 1000;
    let currentBlock = fromBlockNumber;
    let data = [];

    while (currentBlock <= toBlockNumber) {
      const endBlock = Math.min(currentBlock + step - 1, toBlockNumber);
      console.log('currentBlock', currentBlock);
      const blockData = await this.getBlockDonateHistory(
        currentBlock,
        endBlock,
        contract80001,
        provider80001,
      );

      data = [...data, ...blockData];
      currentBlock += step;
    }
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

  async handleChainId5() {
    const { CONTRACT_MAP, abi, RPC_MAP } = config;
    const provider5 = new ethers.JsonRpcProvider(RPC_MAP[this.chainId5]);
    const contract5 = new ethers.Contract(
      CONTRACT_MAP[this.chainId5],
      abi,
      provider5,
    );

    const lastData = await this.getLatestData();

    const blockNumber = await provider5.getBlockNumber();

    const fromBlockNumber = lastData ? lastData.blockNumber + 1 : 0;
    const toBlockNumber = blockNumber - 1;

    const data = await this.getBlockDonateHistory(
      fromBlockNumber,
      toBlockNumber,
      contract5,
      provider5,
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
  async handleChainId137() {
    const { CONTRACT_MAP, abi, RPC_MAP } = config;
    const provider137 = new ethers.JsonRpcProvider(RPC_MAP[this.chainId137]);
    const contract137 = new ethers.Contract(
      CONTRACT_MAP[this.chainId137],
      abi,
      provider137,
    );

    const lastData = await this.getLatestData();

    const blockNumber = await provider137.getBlockNumber();

    const fromBlockNumber = lastData ? lastData.blockNumber + 1 : 0;
    const toBlockNumber = blockNumber - 1;

    const data = await this.getBlockDonateHistory(
      fromBlockNumber,
      toBlockNumber,
      contract137,
      provider137,
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
      await this.handleChainId5();
      await this.handleChainId137();
      await this.handleChainId80001();
    } catch (e) {
      this.logger.error('update new donate history failed: ', e.message);
    }
  }
}
