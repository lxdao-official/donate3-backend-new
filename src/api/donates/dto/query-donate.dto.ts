import { IsNotEmpty } from 'class-validator';

export class QueryDonateDto {
  @IsNotEmpty({ message: '地址不能为空' })
  address: string;
}
