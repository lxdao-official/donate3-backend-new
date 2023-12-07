import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SettingService } from './setting.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
@Controller('setting')
@ApiTags('setting')
export class SettingController {
  constructor(private readonly SettingService: SettingService) {}

  @Post()
  @ApiBody({ type: CreateSettingDto })
  async create(@Body() createSettingDto: CreateSettingDto) {
    try {
      return await this.SettingService.create(createSettingDto);
    } catch (err) {
      return err;
    }
  }
  @Get(':address')
  @ApiParam({ name: 'address', type: 'string' })
  async findSetting(@Param('address') address: string) {
    try {
      return await this.SettingService.findSetting(address);
    } catch (err) {
      return err;
    }
  }
}
