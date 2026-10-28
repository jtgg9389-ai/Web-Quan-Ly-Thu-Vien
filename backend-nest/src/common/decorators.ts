import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Role } from './role.enum';

export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true); // route không cần đăng nhập

export const ROLES = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles); // giới hạn theo vai trò

export interface AuthUser {
  sub: number;
  username: string;
  role: Role;
  readerId: number | null;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user,
);
