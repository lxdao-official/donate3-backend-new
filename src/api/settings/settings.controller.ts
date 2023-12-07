import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { ApiBody, ApiParam } from '@nestjs/swagger';
@Controller('settings')
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
