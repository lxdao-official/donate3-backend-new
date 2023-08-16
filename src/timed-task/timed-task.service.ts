import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';

import { ethers, Contract, EventLog } from 'ethers';
import { DonateHistory } from 'src/database/donateHistory.entity';
import { Repository } from 'typeorm';
import config from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { toLower } from 'lodash';
import { Prisma } from '@prisma/client';

@Injectable()
export class TimedTaskService {
  private readonly logger = new Logger(TimedTaskService.name);
  private providerContracts: {
    [chainId: number]: { provider: ethers.JsonRpcProvider; contract: Contract };
  };

  constructor(
    private configService: ConfigService,
    @InjectRepository(DonateHistory)
    private donateHistory: Repository<DonateHistory>,
    private readonly prismaService: PrismaService,
  ) {
    const { CONTRACT_MAP, abi, abiUid, RPC_MAP, useUidChainId } = config;
    this.providerContracts = {};
    Object.keys(RPC_MAP).forEach((chainId) => {
      const parsedChainId = parseInt(chainId, 10);
      if (CONTRACT_MAP[parsedChainId]) {
        const provider = new ethers.JsonRpcProvider(RPC_MAP[parsedChainId]);
        const contract = new ethers.Contract(
          CONTRACT_MAP[parsedChainId],
          useUidChainId.includes(parsedChainId) ? abiUid : abi,
          provider,
        );
        this.providerContracts[parsedChainId] = { provider, contract };
      }
    });
  }

  async getLatestData(chainId: number) {
    const result = await this.prismaService.donate.findMany({
      where: { chainId },
      orderBy: { blockNumber: 'desc' },
      take: 1,
    });
    return result[0];
  }

  async getBlockDonateHistory(
    chainId: number,
    from: number,
    to: number,
  ): Promise<Prisma.DonateCreateInput[]> {
    const { provider, contract } = this.providerContracts[chainId];
    const transactions = await contract.queryFilter('donateRecord', from, to);

    if (transactions.length === 0) {
      return [];
    }

    const promiseData = transactions.map(async (item: EventLog) => {
      const block = await provider.getBlock(item.blockNumber);
      const transactionInfo = await provider.getTransaction(
        item.transactionHash,
      );

      const [from, to, symbol, amount, msg] = item.args;

      const { UID_CONTRACT_MAP } = config;
      const uid_address = UID_CONTRACT_MAP[chainId];
      let uid = '';
      if (uid_address) {
        const logs = await provider.getLogs({ blockHash: item.blockHash });
        const filterLogs = logs.find(
          (log) =>
            log.transactionHash === item.transactionHash &&
            toLower(log.address) === toLower(uid_address),
        );
        if (filterLogs) {
          uid = filterLogs.data;
        }
      }

      const newData: Prisma.DonateCreateInput = {
        from,
        to,
        blockHash: item.blockHash,
        blockNumber: item.blockNumber,
        money: Number(amount),
        transactionHash: item.transactionHash,
        timestamp: block.timestamp * 1000,
        chainId: Number(transactionInfo.chainId),
        message:
          (msg.startsWith('0x') ? msg : '0x' + msg) === '0x00'
            ? ''
            : ethers.toUtf8String(msg),
        erc20: ethers.decodeBytes32String(symbol),
        uid: uid,
      };

      return newData;
    });
    const result = await Promise.all(promiseData);
    return result;
  }

  async handleChain(chainId: number) {
    const lastData = await this.getLatestData(chainId);
    const { provider, contract } = this.providerContracts[chainId];
    const blockNumber = await provider.getBlockNumber();
    const fromBlockNumber = lastData ? lastData.blockNumber + 1 : 0;
    const toBlockNumber = blockNumber - 1;

    const data = await this.getBlockDonateHistory(
      chainId,
      fromBlockNumber,
      toBlockNumber,
    );

    if (data.length > 0) {
      // await this.donateHistory.save(data);
      try {
        await this.prismaService.donate.createMany({ data: data });
      } catch (e) {
        console.log(e.message);
      }
      this.logger.log(
        `${new Date().toString()}: blockNumber is from ${fromBlockNumber} to ${toBlockNumber}, Update donation historical data quantity: ${
          data.length
        }`,
      );
    } else {
      this.logger.log(`${new Date().toString()}: No data to update`);
    }
  }
  @Cron('0 * * * * *')
  async handleCron() {
    try {
      Object.keys(this.providerContracts).forEach((chainId) => {
        this.handleChain(parseInt(chainId, 10));
      });
    } catch (e) {
      this.logger.error('update new donate history failed: ', e.message);
    }
  }
}
