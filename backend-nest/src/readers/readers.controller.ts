import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators';
import { Role } from '../common/role.enum';
import { Queries } from '../common/swagger';
import { CreateReaderDto, UpdateReaderDto } from './readers.dto';
import { ReadersService } from './readers.service';

@ApiTags('Readers')
@ApiBearerAuth()
@Roles(Role.Admin, Role.Librarian)
@Controller('readers')
export class ReadersController {
  constructor(private s: ReadersService) {}

  @ApiOperation({ summary: 'Danh sách và tra cứu độc giả (Admin, Thủ thư)' })
  @Queries('search', 'page', 'limit')
  @Get() list(@Query() q: Record<string, string>) { return this.s.findAll(q); }

  @ApiOperation({ summary: 'Chi tiết một độc giả' })
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.s.findOne(id); }

  @ApiOperation({ summary: 'Thêm độc giả. Bỏ trống code để tự sinh mã' })
  @Post() create(@Body() d: CreateReaderDto) { return this.s.create(d); }

  @ApiOperation({ summary: 'Sửa thông tin độc giả' })
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() d: UpdateReaderDto) { return this.s.update(id, d); }

  @ApiOperation({ summary: 'Xóa độc giả chưa có phiếu mượn' })
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.s.remove(id); }
}
