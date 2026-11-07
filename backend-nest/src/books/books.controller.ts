import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators';
import { Role } from '../common/role.enum';
import { Queries } from '../common/swagger';
import { CreateBookDto, UpdateBookDto } from './books.dto';
import { BooksService } from './books.service';

@ApiTags('Books')
@ApiBearerAuth()
@Controller('books')
export class BooksController {
  constructor(private s: BooksService) {}

  @ApiOperation({ summary: 'Danh sách và tìm kiếm sách (mọi người dùng đã đăng nhập)' })
  @Queries('search', 'category', 'page', 'limit')
  @Get() list(@Query() q: Record<string, string>) { return this.s.findAll(q); }

  @ApiOperation({ summary: 'Chi tiết một cuốn sách' })
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.s.findOne(id); }

  @ApiOperation({ summary: 'Thêm sách (Admin, Thủ thư). Bỏ trống code để tự sinh mã' })
  @Roles(Role.Admin, Role.Librarian) @Post()
  create(@Body() d: CreateBookDto) { return this.s.create(d); }

  @ApiOperation({ summary: 'Sửa thông tin sách (Admin, Thủ thư)' })
  @Roles(Role.Admin, Role.Librarian) @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() d: UpdateBookDto) { return this.s.update(id, d); }

  @ApiOperation({ summary: 'Xóa sách chưa có phiếu mượn (Admin, Thủ thư)' })
  @Roles(Role.Admin, Role.Librarian) @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.s.remove(id); }
}
