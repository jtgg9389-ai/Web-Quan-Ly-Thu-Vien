import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser, Roles } from '../common/decorators';
import { Role } from '../common/role.enum';
import { Queries } from '../common/swagger';
import { CreateLoanDto, ReturnLoanDto } from './loans.dto';
import { LoansService } from './loans.service';

@ApiTags('Loans')
@ApiBearerAuth()
@Controller('loans')
export class LoansController {
  constructor(private s: LoansService) {}

  @ApiOperation({ summary: 'Phiếu mượn của chính độc giả đang đăng nhập' })
  @Get('my')
  mine(@CurrentUser() u: AuthUser) { return this.s.findMine(u.readerId); }

  @ApiOperation({ summary: 'Danh sách phiếu mượn - trả, kèm số ngày trễ và tiền phạt (Admin, Thủ thư)' })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'returned', 'overdue'], description: 'active = đang mượn, overdue = quá hạn' })
  @Queries('search', 'readerId', 'page', 'limit')
  @Roles(Role.Admin, Role.Librarian) @Get()
  list(@Query() q: Record<string, string>) { return this.s.findAll(q); }

  @ApiOperation({ summary: 'Lập phiếu mượn, tự trừ số lượng sách còn lại (Admin, Thủ thư)' })
  @Roles(Role.Admin, Role.Librarian) @Post()
  create(@Body() d: CreateLoanDto, @CurrentUser() u: AuthUser) { return this.s.create(d, u); }

  @ApiOperation({ summary: 'Lập phiếu trả, tự tính tiền phạt và cộng lại số lượng sách (Admin, Thủ thư)' })
  @Roles(Role.Admin, Role.Librarian) @Post(':id/return')
  giveBack(@Param('id', ParseIntPipe) id: number, @Body() d: ReturnLoanDto) { return this.s.giveBack(id, d); }
}
