import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Public } from './common/decorators';

@Controller()
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  // GET /api/health - kiểm tra server và kết nối CSDL
  @Public()
  @Get('health')
  async health() {
    await this.dataSource.query('SELECT 1');
    return { status: 'ok', database: 'connected', type: this.dataSource.options.type, time: new Date().toISOString() };
  }
}
