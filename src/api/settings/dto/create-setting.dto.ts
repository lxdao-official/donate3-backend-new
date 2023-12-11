import { ApiProperty } from '@nestjs/swagger';

export class CreateSettingDto {
  @ApiProperty({
    name: 'signature',
    type: 'string',
    default:
      '0x310e3a3b75602e1d26e86f124237a4e932ec40317a842d4a496754145d06385a44482423ac9868e7604de8a2898793ad915ce4cacee9310e5932d19a34dab3be1b',
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
      '{"type":0,"address":"0x11478E001E70e70A80654A820e4c947b68E970d8","color":"#0f1302","name":"Donate3","avatar":"","description":"","twitter":"","telegram":""}',
  })
  message: string;
}
