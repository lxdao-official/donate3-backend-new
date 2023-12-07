import { Injectable, Logger } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ethers } from 'ethers';
import { Prisma } from '@prisma/client';

@Injectable()
export class SettingService {
  private readonly logger = new Logger(SettingService.name);
  constructor(private prismaService: PrismaService) {}
  async create(createSettingDto: CreateSettingDto) {
    const { message, signature, address } = createSettingDto;

    const verifyMessageAddress = ethers.verifyMessage(message, signature);

    if (verifyMessageAddress !== address)
      return { message: 'Address check failure' };

    const info = JSON.parse(message);
    const data: Prisma.SettingCreateInput = {
      address,
      setting: message,
      ...info,
    };
    const oldInfo = await this.prismaService.setting.findFirst({
      where: { address },
    });
    let result = {};
    if (oldInfo) {
      result = await this.prismaService.setting.update({
        where: { address },
        data,
      });
    } else {
      result = await this.prismaService.setting.create({
        data,
      });
    }
    return result;
  }

  async findSetting(address: string) {
    try {
      const setting = await this.prismaService.setting.findFirst({
        where: { address },
      });
      return setting;
    } catch (err) {
      return err;
    }
  }
}
