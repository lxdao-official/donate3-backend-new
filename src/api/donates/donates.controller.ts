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
  findDonatesFromAddress(@Query() queryInfo: QueryDonateDto) {
    return this.donatesService.findDonatesFromAddress(queryInfo);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.donatesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDonateDto: UpdateDonateDto) {
  //   return this.donatesService.update(+id, updateDonateDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.donatesService.remove(+id);
  // }
}
