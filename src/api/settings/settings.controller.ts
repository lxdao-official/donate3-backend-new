import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
@Controller('settings')
@ApiTags('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiBody({ type: CreateSettingDto })
  async create(@Body() createSettingDto: CreateSettingDto) {
    try {
      return await this.settingsService.create(createSettingDto);
    } catch (err) {
      return err;
    }
  }
  @Get()
  @ApiQuery({ name: 'num', type: 'number', required: false })
  async find(@Query('num') num: number) {
    try {
      return await this.settingsService.findAllData(num || 20);
    } catch (err) {
      return err;
    }
  }
  @Get(':address')
  @ApiParam({ name: 'address', type: 'string' })
  async findSetting(@Param('address') address: string) {
    try {
      return await this.settingsService.findSetting(address);
    } catch (err) {
      return err;
    }
  }
}
