import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { IsEnum } from 'class-validator';
import { Repository } from 'typeorm';
import { AuthUser, CurrentUser, Roles } from '../common/decorators';
import { Role } from '../common/role.enum';
import { User } from '../entities';

class UpdateRoleDto {
  @IsEnum(Role, { message: 'Vai trò phải là admin, librarian hoặc reader' }) role: Role;
}

// Quản lý tài khoản: chỉ quản trị
@ApiTags('Users')
@ApiBearerAuth()
@Roles(Role.Admin)
@Controller('users')
export class UsersController {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  @ApiOperation({ summary: 'Danh sách tài khoản (chỉ Admin)' })
  @Get()
  async list() {
    const users = await this.repo.find({ relations: { reader: true }, order: { id: 'ASC' } });
    return users.map((u) => ({ id: u.id, username: u.username, fullName: u.fullName, role: u.role, readerId: u.reader?.id ?? null }));
  }

  @ApiOperation({ summary: 'Đổi vai trò tài khoản: admin, librarian, reader (chỉ Admin)' })
  @Patch(':id/role')
  async setRole(@Param('id', ParseIntPipe) id: number, @Body() d: UpdateRoleDto, @CurrentUser() me: AuthUser) {
    if (id === me.sub) throw new BadRequestException('Không thể đổi vai trò của chính mình');
    const u = await this.repo.findOneBy({ id });
    if (!u) throw new NotFoundException('Không tìm thấy tài khoản');
    u.role = d.role;
    await this.repo.save(u);
    return { id: u.id, username: u.username, role: u.role };
  }

  @ApiOperation({ summary: 'Xóa tài khoản (chỉ Admin)' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() me: AuthUser) {
    if (id === me.sub) throw new BadRequestException('Không thể xóa chính mình');
    const r = await this.repo.delete(id);
    if (!r.affected) throw new NotFoundException('Không tìm thấy tài khoản');
    return { message: 'Đã xóa tài khoản' };
  }
}
