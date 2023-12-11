import { Injectable, Logger } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ethers } from 'ethers';
import { Prisma } from '@prisma/client';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  constructor(private readonly prismaService: PrismaService) {}
  async create(createSettingDto: CreateSettingDto) {
    const { message, signature, address } = createSettingDto;

    const verifyMessageAddress = ethers.verifyMessage(message, signature);

    if (verifyMessageAddress !== address)
      return { message: 'Address check failure' };

    const info = JSON.parse(message);
    const data: Prisma.SettingsCreateInput = {
      address,
      setting: message,
      ...info,
    };
    const oldInfo = await this.prismaService.settings.findUnique({
      where: { address },
    });
    let result = {};
    if (oldInfo) {
      result = await this.prismaService.settings.update({
        where: { id: oldInfo.id },
        data,
      });
    } else {
      result = await this.prismaService.settings.create({
        data,
      });
    }
    return result;
  }

  async findSetting(address: string) {
    try {
      const setting = await this.prismaService.settings.findUnique({
        where: { address },
      });
      return setting;
    } catch (err) {
      return err;
    }
  }

  async findAllData(num: number) {
    try {
      const setting = await this.prismaService.settings.findMany();
      const maxLength = setting.length;
      const allNumbers = new Set();

      if (maxLength <= num) {
        return setting;
      }

      while (allNumbers.size < num) {
        const randomNum = Math.floor(Math.random() * maxLength);
        allNumbers.add(randomNum);
      }
      const result = setting.filter((i, index) => allNumbers.has(index));

      return result;
    } catch (err) {
      return err;
    }
  }
}
