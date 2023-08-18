// donation-ranking-by-usdt.dto.ts
import { IsNotEmpty } from 'class-validator';

export class DonationRankingByUsdtDto {
  @IsNotEmpty({ message: 'address is required' })
  address: string;

  @IsNotEmpty({ message: 'totalDonation is required' })
  totalDonation: number;

  @IsNotEmpty({ message: 'top is required' })
  top: string;
}
