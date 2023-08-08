import { IsNotEmpty } from 'class-validator';

export class QueryDonationAmount {
  @IsNotEmpty({ message: '地址不能为空' })
  address: string;
}
