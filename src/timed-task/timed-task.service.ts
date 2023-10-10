import { CreateDonateDto } from './../api/donates/dto/create-donate.dto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

import { ethers, Contract, EventLog } from 'ethers';
import config from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { toLower } from 'lodash';
import { Prisma } from '@prisma/client';
import { DonatesService } from 'src/api/donates/donates.service';
import { HttpService } from '@nestjs/axios';

interface ChainIdsItem {
  name: string;
  chain: string;
  icon: string;
  rpc: string[];
  features: any[];
  faucets: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  infoURL: string;
  shortName: string;
  chainId: number;
  networkId: number;
  slip44: number;
  ens: any;
  explorers: any[];
}

@Injectable()
export class TimedTaskService {
  private readonly logger = new Logger(TimedTaskService.name);
  private providerContracts: {
    [chainId: number]: { provider: ethers.JsonRpcProvider; contract: Contract };
  };
  private priceList = [];
  private chainIdList: ChainIdsItem[] = [];

  constructor(
    private configService: ConfigService,
    private readonly prismaService: PrismaService,
    private donateService: DonatesService,
    private httpService: HttpService,
  ) {
    try {
      const { CONTRACT_MAP, abi, abiUid, RPC_MAP, useUidChainId } = config;
      const INFURA_APIKEY = this.configService.get('INFURA_APIKEY');
      this.providerContracts = {};
      Object.keys(RPC_MAP).forEach((chainId) => {
        const parsedChainId = parseInt(chainId, 10);
        if (CONTRACT_MAP[parsedChainId]) {
          const url = RPC_MAP[parsedChainId] + INFURA_APIKEY;
          const provider = new ethers.JsonRpcProvider(url);
          const contract = new ethers.Contract(
            CONTRACT_MAP[parsedChainId],
            useUidChainId.includes(parsedChainId) ? abiUid : abi,
            provider,
          );
          this.providerContracts[parsedChainId] = { provider, contract };
        }
      });

      this.getChainIdList();
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  async getChainIdList() {
    try {
      const { data = [] } = await this.httpService.axiosRef.get(
        'https://chainid.network/chains.json',
      );
      this.chainIdList = data;
    } catch (e) {
      this.logger.error('getChainIdList:', 'error', e.message);
    }
  }

  async getLatestData(chainId: number) {
    const result = await this.prismaService.donation.findMany({
      where: { chainId },
      orderBy: { blockNumber: 'desc' },
      take: 1,
    });
    return result[0];
  }

  async getErc20TokenSymbol(provider, address, chainId) {
    try {
      if (parseInt(address) === 0) {
        if (!!this.chainIdList || this.chainIdList.length === 0) {
          this.getChainIdList();
        }
        const chainInfo = this.chainIdList.find(
          (item) => item.chainId === parseInt(chainId),
        );
        return chainInfo.nativeCurrency?.symbol || '';
      }
      const tokenContractABI = ['function symbol() view returns (string)'];
      const tokenContract = new ethers.Contract(
        address,
        tokenContractABI,
        provider,
      );
      const symbol = await tokenContract.symbol();
      return symbol;
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  async getBlockDonateHistory(
    chainId: number,
    from: number,
    to: number,
  ): Promise<Prisma.DonationCreateInput[]> {
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
      const inputData = contract.interface.decodeFunctionData(
        ` function donate(
          address,
          uint256,
          address,
          bytes calldata _message,
          bytes32[] calldata _merkleProof
      )`,
        transactionInfo.data,
      );

      const token_address = inputData[0];
      const erc20 = await this.getErc20TokenSymbol(
        provider,
        token_address,
        transactionInfo.chainId,
      );

      const [from, to, amount, msg] = item.args;

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

      const newData: Prisma.DonationCreateInput = {
        from,
        to,
        blockHash: item.blockHash,
        blockNumber: item.blockNumber,
        money: String(amount),
        transactionHash: item.transactionHash,
        timestamp: (block.timestamp * 1000).toString(),
        chainId: Number(transactionInfo.chainId),
        message:
          (msg.startsWith('0x') ? msg : '0x' + msg) === '0x00'
            ? ''
            : ethers.toUtf8String(msg),
        erc20,
        // ethers.decodeBytes32String(symbol)
        uid,
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
      try {
        if (this.priceList.length == 0) {
          this.priceList = await this.donateService.getTokenPrice();
        }
        const dataWithAmount: Partial<CreateDonateDto>[] =
          this.donateService.getDonateHistoryWithAmount(data, this.priceList);
        await this.prismaService.donation.createMany({
          data: dataWithAmount as unknown as Prisma.DonationCreateManyInput[],
        });
      } catch (e) {
        this.logger.error(e.message);
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

  @Cron('0 */10 * * * *')
  async handleCron() {
    try {
      Object.keys(this.providerContracts).forEach((chainId) => {
        this.handleChain(parseInt(chainId, 10));
      });
    } catch (e) {
      this.logger.error('update new donate history failed: ', e.message);
    }
  }

  @Cron('0 0 * * * *')
  async calculateDonationValue() {
    try {
      this.priceList = await this.donateService.getTokenPrice();
      const allData = await this.donateService.findDonates({});
      const allHistoryWithAmount =
        this.donateService.getDonateHistoryWithAmount(allData, this.priceList);
      console.log('allHistoryWithAmount', allHistoryWithAmount.length);
      const update: Prisma.DonationUpdateArgs[] = allHistoryWithAmount.map(
        (item) => {
          return {
            where: {
              id: item.id,
            },
            data: {
              amount: item.amount,
              price: item.price,
            },
          };
        },
      );
      await this.donateService.updateAllDataPrice(update);
      this.logger.log('update price: successful');
    } catch (e) {
      this.logger.error('calculate donation value failed: ', e.message);
    }
  }
}
