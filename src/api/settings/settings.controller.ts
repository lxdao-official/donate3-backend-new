import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { ApiBody, ApiParam } from '@nestjs/swagger';
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiBody({ type: CreateSettingDto })
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }
  @Get(':address')
  @ApiParam({ name: 'address', type: 'string' })
  findSetting(@Param('address') address: string) {
    return this.settingsService.findSetting(address);
  }
}
