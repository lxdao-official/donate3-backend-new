import { ApiProperty } from '@nestjs/swagger';

export class CreateSettingDto {
  @ApiProperty({
    name: 'signature',
    type: 'string',
    default:
      '0xcfaacdefb3784d0e651cd8740a9db2041bef2da9090eeff74ea8ab0372ec63a42f5c82f3a799b81dd2329714a90bef22e2de51bdeb664e374f87dcf2650956dc1b',
  })
  signature: string;
  @ApiProperty({
    name: 'address',
    type: 'string',
    default: '0x11478E001E70e70A80654A820e4c947b68E970d8',
  })
  address: string;
  @ApiProperty({
    name: 'message',
    type: 'string',
    default:
      '{"type":1,"address":"0x11478E001E70e70A80654A820e4c947b68E970d8","color":"#2b3607","name":"Donate3","avatar":"https://nftstorage.link/ipfs/bafkreicni4lkqxrwjcaw7ckpqqe3n6etx6gnpzgx6qvo3xaznoroli7gnu","description":"<p>donate3official</p>","twitter":"https://twitter.com/donate3official","telegram":"https://t.me/donate3official"}',
  })
  message: string;
}
