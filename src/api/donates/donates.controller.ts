import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DonatesService } from './donates.service';
import { CreateDonateDto } from './dto/create-donate.dto';
import { UpdateDonateDto } from './dto/update-donate.dto';
import { QueryDonateDto } from './dto/query-donate.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DonationRankingDto } from './dto/donation-ranking.dto';
import { QueryDonationAmount } from './dto/query-donation-amount.dto';

@Controller('donates')
export class DonatesController {
  constructor(private readonly donatesService: DonatesService) {}

  // @Post()
  // create(@Body() createDonateDto: CreateDonateDto) {
  //   return this.donatesService.create(createDonateDto);
  // }

  @Get()
  @ApiOperation({
    summary: 'Query donation information',
    description: 'Query all donation information for an address',
  })
  @ApiQuery({
    name: 'address',
    type: 'string',
    description: 'The address of the donor',
    required: true,
  })
  async findDonatesFromAddress(@Query() queryInfo: QueryDonateDto) {
    const data = await this.donatesService.findDonatesFromAddress(queryInfo);
    return data;
  }

  @Get('ranking')
  @ApiOperation({
    summary: 'Get donation rankings',
    description: 'Query the list of donations received at an address',
  })
  @ApiQuery({
    name: 'address',
    type: 'string',
    description: 'An address to receive donations',
    required: true,
  })
  @ApiQuery({
    name: 'chainId',
    type: 'number',
    description: 'chainId',
    required: true,
  })
  async getDonationRanking(@Query() queryInfo: DonationRankingDto) {
    const { address, chainId } = queryInfo;
    return await this.donatesService.getDonationRanking(address, chainId);
  }

  @Get('donation-amount')
  @ApiOperation({
    summary: 'Get the full amount donated',
    description: 'Query the amount of donations received at an address',
  })
  @ApiQuery({
    name: 'address',
    type: 'string',
    description: 'The address that was donated',
    required: true,
  })
  async getAllDonationAmount(@Query() queryInfo: QueryDonationAmount) {
    const { address } = queryInfo;
    const result = await this.donatesService.getAllDonationAmount(address);
    return result;
  }

  @Get('donator-history')
  @ApiOperation({
    summary: `Get the donor's donation history`,
    description: 'Query the donation history of an address',
  })
  @ApiQuery({
    name: 'address',
    type: 'string',
    description: `Donor's address`,
    required: true,
  })
  async getAllDonatorHistory(@Query() queryInfo: QueryDonationAmount) {
    const { address } = queryInfo;
    const result = await this.donatesService.getAllDonatorHistory(address);
    return result;
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDonateDto: UpdateDonateDto) {
  //   return this.donatesService.update(+id, updateDonateDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.donatesService.remove(+id);
  // }
}
