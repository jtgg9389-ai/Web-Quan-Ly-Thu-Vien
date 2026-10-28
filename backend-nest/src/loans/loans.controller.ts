import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { AuthUser, CurrentUser, Roles } from '../common/decorators';
import { Role } from '../common/role.enum';
import { CreateLoanDto, ReturnLoanDto } from './loans.dto';
import { LoansService } from './loans.service';

@Controller('loans')
export class LoansController {
  constructor(private s: LoansService) {}

  // Độc giả xem phiếu mượn của chính mình
  @Get('my')
  mine(@CurrentUser() u: AuthUser) { return this.s.findMine(u.readerId); }

  @Roles(Role.Admin, Role.Librarian) @Get()
  list(@Query() q: Record<string, string>) { return this.s.findAll(q); }

  @Roles(Role.Admin, Role.Librarian) @Post()
  create(@Body() d: CreateLoanDto, @CurrentUser() u: AuthUser) { return this.s.create(d, u); }

  @Roles(Role.Admin, Role.Librarian) @Post(':id/return')
  giveBack(@Param('id', ParseIntPipe) id: number, @Body() d: ReturnLoanDto) { return this.s.giveBack(id, d); }
}
