import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsNotEmpty, Contains } from 'class-validator';

export class QueryDonateDto {
  @ApiPropertyOptional({
    description: `address`,
    default: '0x1fD144f8D069504Af50676913f81431Ea2419103',
  })
  from: string;

  @ApiPropertyOptional({
    type: [String],
    default: ['0xe395B9bA2F93236489ac953146485C435D1A267B'],
  })
  tos: string[];

  @ApiPropertyOptional()
  message: string;

  @ApiPropertyOptional({ type: [Number], default: [59144] })
  chainIds: number[];

  @ApiPropertyOptional({ type: [String], default: ['LINEA'] })
  tokens: string[];

  @ApiPropertyOptional()
  uid: string;

  @ApiProperty({ required: true, default: 0 })
  page: number;

  @ApiProperty({ required: true, default: 10 })
  size: number;
  @ApiPropertyOptional({ default: [{ money: 'desc' }, { timestamp: 'desc' }] })
  orderBy: Prisma.DonationOrderByWithRelationInput;
}
