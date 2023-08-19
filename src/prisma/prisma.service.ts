import { Global, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Global()
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async findDonateHistory(params: Prisma.DonationWhereInput) {
    return this.donation.findMany({
      where: params,
      select: {
        from: true,
        money: true,
        erc20: true,
      },
    });
  }
}
