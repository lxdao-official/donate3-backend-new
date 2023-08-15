import { IsNotEmpty } from 'class-validator';

export class QueryDonateDto {
  @IsNotEmpty({ message: 'address is required' })
  address: string;
}
