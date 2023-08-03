// donation-ranking.dto.ts
import { IsNotEmpty } from 'class-validator';

export class DonationRankingDto {
  @IsNotEmpty({ message: '地址不能为空' })
  address: string;

  @IsNotEmpty({ message: 'chainId不能为空' })
  chainId: number;
}
