import { Injectable, Logger } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ethers } from 'ethers';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  constructor(private prismaService: PrismaService) {}
  async create(createSettingDto: CreateSettingDto) {
    const { message, signature, address } = createSettingDto;

    const verifyMessageAddress = ethers.verifyMessage(message, signature);

    if (verifyMessageAddress !== address)
      return { message: 'Address check failure' };

    const info = JSON.parse(message);

    const setting = await this.prismaService.setting.findUnique({
      where: { address },
    });
    let result = {};
    if (setting) {
      result = await this.prismaService.setting.update({
        where: { address },
        data: {
          setting: message,
          ...info,
        },
      });
    } else {
      result = await this.prismaService.setting.create({
        data: { address, setting: message, ...info },
      });
    }
    return result;
  }

  async findSetting(address: string) {
    const setting = await this.prismaService.setting.findUnique({
      where: { address },
    });
    return setting;
  }
}
