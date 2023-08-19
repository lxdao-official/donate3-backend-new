// total-donation-sum.dto.ts
import { IsNotEmpty } from 'class-validator';

export class TotalDonationSumDto {
  @IsNotEmpty({ message: 'address is required' })
  address: string;
}
