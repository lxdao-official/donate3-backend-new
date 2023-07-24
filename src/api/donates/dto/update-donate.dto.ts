import { PartialType } from '@nestjs/swagger';
import { CreateDonateDto } from './create-donate.dto';

export class UpdateDonateDto extends PartialType(CreateDonateDto) {}
