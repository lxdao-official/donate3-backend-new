import { Injectable, Logger } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { verifyMessage } from 'viem';
import { ethers } from 'ethers';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  constructor(private prismaService: PrismaService) {}
  async create(createSettingDto: CreateSettingDto) {
    const { name, description, telegram, color } = createSettingDto;

    // const message =
    //   '{"type":1,"address":"0x11478E001E70e70A80654A820e4c947b68E970d8","color":"#2b3607","name":"Donate3","avatar":"https://nftstorage.link/ipfs/bafkreicni4lkqxrwjcaw7ckpqqe3n6etx6gnpzgx6qvo3xaznoroli7gnu","description":"<p>donate3official</p >","twitter":"https://twitter.com/donate3official","telegram":"https://t.me/donate3official"}';
    // const signature =
    //   '0xcfaacdefb3784d0e651cd8740a9db2041bef2da9090eeff74ea8ab0372ec63a42f5c82f3a799b81dd2329714a90bef22e2de51bdeb664e374f87dcf2650956dc1b' as any as `0x${string}`;

    // const sign = await verifyMessage({
    //   address: '0x5eB9Ba95FF24d1b0cf9dbEe0d254b11B225082a6',
    //   message,
    //   signature,
    // });

    // const sign2 = ethers.verifyMessage(message, signature);

    const message =
      '{"type":1,"address":"0x11478E001E70e70A80654A820e4c947b68E970d8","color":"#2b3607","name":"Donate3","avatar":"https://nftstorage.link/ipfs/bafkreicni4lkqxrwjcaw7ckpqqe3n6etx6gnpzgx6qvo3xaznoroli7gnu","description":"<p>donate3official</p >","twitter":"https://twitter.com/donate3official","telegram":"https://t.me/donate3official"}';
    const signature =
      '0xcfaacdefb3784d0e651cd8740a9db2041bef2da9090eeff74ea8ab0372ec63a42f5c82f3a799b81dd2329714a90bef22e2de51bdeb664e374f87dcf2650956dc1b';

    const sign = await verifyMessage({
      address: '0x11478E001E70e70A80654A820e4c947b68E970d8',
      message,
      signature,
    });

    const sign2 = ethers.verifyMessage(message, signature);
    console.log(sign, sign2);

    return { sign, sign2 };
    // const address = '';
    // const setting = await this.prismaService.setting.findUnique({
    //   where: { address },
    // });
    // let result = {};
    // if (setting) {
    //   result = await this.prismaService.setting.update({
    //     where: { address },
    //     data: {
    //       name,
    //       description,
    //       telegram,
    //       color,
    //     },
    //   });
    // } else {
    //   result = await this.prismaService.setting.create({
    //     data: { address, name, description, telegram, color },
    //   });
    // }
    // return result;
  }
}
