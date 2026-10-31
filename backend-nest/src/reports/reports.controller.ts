import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators';
import { Role } from '../common/role.enum';
import { Queries } from '../common/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Roles(Role.Admin, Role.Librarian)
@Controller('reports')
export class ReportsController {
  constructor(private s: ReportsService) {}

  @ApiOperation({ summary: 'Tổng quan: số đầu sách, số bản, độc giả, phiếu đang mượn, quá hạn, tiền phạt' })
  @Get('summary') summary() { return this.s.summary(); }

  @ApiOperation({ summary: 'Thống kê số lượng sách theo thể loại' })
  @Get('categories') categories() { return this.s.categories(); }

  @ApiOperation({ summary: 'Sách được mượn nhiều nhất' })
  @Queries('limit')
  @Get('top-books') top(@Query('limit') limit?: string) { return this.s.topBooks(Math.min(50, Number(limit) || 5)); }

  @ApiOperation({ summary: 'Số lượt mượn theo tháng' })
  @Get('loans-by-month') byMonth() { return this.s.loansByMonth(); }
}
