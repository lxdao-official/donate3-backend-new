import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsNotEmpty, Contains } from 'class-validator';

export class QueryDonateDto {
  @ApiPropertyOptional({
    description: `address`,
    default: '0x1fD144f8D069504Af50676913f81431Ea2419103',
  })
  from: string;

  @ApiProperty({
    required: false,
    default: '0xe395B9bA2F93236489ac953146485C435D1A267B',
  })
  to: string;

  @ApiProperty({ required: false })
  message: string;

  @ApiProperty({ type: [Number], required: false, default: [59144] })
  chainIds: number[];

  @ApiProperty({ type: [String], required: false, default: ['LINEA'] })
  tokens: string[];

  @ApiProperty({ required: false })
  uid: string;

  @ApiProperty({ required: true, default: 0 })
  page: number;

  @ApiProperty({ required: true, default: 10 })
  size: number;
  @ApiPropertyOptional({ default: [{ money: 'desc' }, { timestamp: 'desc' }] })
  orderBy: Prisma.DonationOrderByWithRelationInput;
}
