import { IsNotEmpty } from 'class-validator';

export class QueryDonationAmount {
  @IsNotEmpty({ message: 'address is required' })
  address: string;
}
