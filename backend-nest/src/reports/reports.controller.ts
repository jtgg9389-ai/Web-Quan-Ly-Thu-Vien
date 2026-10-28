import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../common/decorators';
import { Role } from '../common/role.enum';
import { ReportsService } from './reports.service';

@Roles(Role.Admin, Role.Librarian)
@Controller('reports')
export class ReportsController {
  constructor(private s: ReportsService) {}

  @Get('summary') summary() { return this.s.summary(); }
  @Get('categories') categories() { return this.s.categories(); }
  @Get('top-books') top(@Query('limit') limit?: string) { return this.s.topBooks(Math.min(50, Number(limit) || 5)); }
  @Get('loans-by-month') byMonth() { return this.s.loansByMonth(); }
}
