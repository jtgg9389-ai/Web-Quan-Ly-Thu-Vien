import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../common/decorators';
import { Role } from '../common/role.enum';
import { CreateReaderDto, UpdateReaderDto } from './readers.dto';
import { ReadersService } from './readers.service';

@Roles(Role.Admin, Role.Librarian)
@Controller('readers')
export class ReadersController {
  constructor(private s: ReadersService) {}

  @Get() list(@Query() q: Record<string, string>) { return this.s.findAll(q); }
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.s.findOne(id); }
  @Post() create(@Body() d: CreateReaderDto) { return this.s.create(d); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() d: UpdateReaderDto) { return this.s.update(id, d); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.s.remove(id); }
}
