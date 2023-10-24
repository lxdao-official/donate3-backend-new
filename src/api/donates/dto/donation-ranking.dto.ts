// donation-ranking.dto.ts
import { IsNotEmpty } from 'class-validator';

export class DonationRankingDto {
  @IsNotEmpty({ message: 'address is required' })
  address: string;

  chainId: number;
}
