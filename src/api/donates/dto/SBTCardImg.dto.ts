// donation-ranking-by-usdt.dto.ts
import { IsNotEmpty } from 'class-validator';

export class SBTCardImgDto {
  @IsNotEmpty({ message: 'address is required' })
  address: string;

  @IsNotEmpty({ message: 'id is required' })
  id: number;
}
