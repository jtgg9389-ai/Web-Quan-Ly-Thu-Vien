import { Body, Controller, Get, Put } from '@nestjs/common';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Roles } from '../common/decorators';
import { Role } from '../common/role.enum';
import { SettingsService } from './settings.service';

class UpdateSettingsDto {
  @IsOptional() @IsInt() @Min(1) @Max(365) loanDays?: number;
  @IsOptional() @IsInt() @Min(0) finePerDay?: number;
}

@Controller('settings')
export class SettingsController {
  constructor(private s: SettingsService) {}

  @Roles(Role.Admin, Role.Librarian)
  @Get()
  get() { return this.s.getAll(); }

  @Roles(Role.Admin)
  @Put()
  update(@Body() d: UpdateSettingsDto) { return this.s.update(d); }
}
