import { Donate } from './entities/donate.entity';
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
import { ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DonationRankingDto } from './dto/donation-ranking.dto';
import { QueryDonationAmount } from './dto/query-donation-amount.dto';
import { TotalDonationSumDto } from './dto/total-donation-sum.dto';
import { Prisma } from '@prisma/client';

@Controller('donates')
export class DonatesController {
  constructor(private readonly donatesService: DonatesService) {}

  @Post()
  @ApiOperation({
    summary: 'Query donation information',
    description: 'Query all donation information',
  })
  @ApiBody({ type: QueryDonateDto })
  async findDonatesFromAddress(@Body() queryInfo: QueryDonateDto) {
    const data = await this.donatesService.findDonatesList(queryInfo);
    return data;
  }

  @Get('ranking')
  @ApiOperation({
    summary: 'Get donation ranking by chainId',
    description: 'Query the list of donations received at an address',
  })
  @ApiQuery({
    name: 'address',
    type: 'string',
    description: `Recipient's address`,
    required: true,
  })
  @ApiQuery({
    name: 'chainId',
    type: 'number',
    description: 'chainId',
    required: false,
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
    description: `Recipient's address`,
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

  @Get('donation-ranking-by-usdt')
  @ApiOperation({
    summary: 'Get donation ranking by USDT',
    description:
      'Query the ranking of donations received in USDT for a specific recipient address',
  })
  @ApiQuery({
    name: 'address',
    type: 'string',
    description: `Recipient's address`,
    required: true,
  })
  async getDonationRankByUsdt(@Query('address') address: string) {
    const ranking = await this.donatesService.getDonationRankByUsdt(address);
    return ranking;
  }

  @Get('total-donation-sum')
  @ApiOperation({
    summary: 'Get the total donation sum of USDT',
    description:
      'Returns the total donation amount of the address indicated by the Usdt',
  })
  @ApiQuery({
    name: 'address',
    description: `Recipient's address`,
    required: true,
  })
  async getTotalDonationSum(
    @Query() query: TotalDonationSumDto,
  ): Promise<number> {
    const { address } = query;
    const totalDonationSum = await this.donatesService.getTotalDonationSum(
      address,
    );
    return totalDonationSum;
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
