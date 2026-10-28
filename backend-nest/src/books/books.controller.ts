import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../common/decorators';
import { Role } from '../common/role.enum';
import { CreateBookDto, UpdateBookDto } from './books.dto';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private s: BooksService) {}

  // Mọi người dùng đã đăng nhập đều xem/tra cứu được sách
  @Get() list(@Query() q: Record<string, string>) { return this.s.findAll(q); }
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.s.findOne(id); }

  @Roles(Role.Admin, Role.Librarian) @Post()
  create(@Body() d: CreateBookDto) { return this.s.create(d); }

  @Roles(Role.Admin, Role.Librarian) @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() d: UpdateBookDto) { return this.s.update(id, d); }

  @Roles(Role.Admin, Role.Librarian) @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.s.remove(id); }
}
