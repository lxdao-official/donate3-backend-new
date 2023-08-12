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
    summary: '查询捐赠信息',
    description: '查询某个地址所有的捐赠信息',
  })
  @ApiQuery({
    name: 'address',
    type: 'string',
    description: '被捐赠人的地址',
    required: true,
  })
  async findDonatesFromAddress(@Query() queryInfo: QueryDonateDto) {
    const data = await this.donatesService.findDonatesFromAddress(queryInfo);
    return { data, code: 200, message: '请求成功' };
  }

  @Get('ranking')
  @ApiOperation({
    summary: '获取捐赠排行榜',
    description: '查询某个地址接收到的捐赠排行榜',
  })
  @ApiQuery({
    name: 'address',
    type: 'string',
    description: '接收捐赠的地址',
    required: true,
  })
  @ApiQuery({
    name: 'chainId',
    type: 'number',
    description: '链ID',
    required: true,
  })
  async getDonationRanking(@Query() queryInfo: DonationRankingDto) {
    const { address, chainId } = queryInfo;
    return await this.donatesService.getDonationRanking(address, chainId);
  }

  @Get('donation-amount')
  @ApiOperation({
    summary: '获取捐赠的所有金额',
    description: '查询某个地址接收到的捐赠金额',
  })
  @ApiQuery({
    name: 'address',
    type: 'string',
    description: '接收捐赠的地址',
    required: true,
  })
  async getAllDonationAmount(@Query() queryInfo: QueryDonationAmount) {
    const { address } = queryInfo;
    const result = await this.donatesService.getAllDonationAmount(address);
    return result;
  }

  @Get('donationsCount')
  @ApiOperation({
    summary: '查询捐赠人数',
    description: '查询某个地址所有的捐赠信息的人数',
  })
  @ApiQuery({
    name: 'address',
    type: 'string',
    description: '被捐赠人的地址',
    required: true,
  })
  async getTotalDonationCount(@Query() queryInfo: QueryDonateDto) {
    const data = await this.donatesService.getTotalDonationAddress(queryInfo);
    return { data, code: 200, message: '请求成功' };
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
