import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthUser, CurrentUser, Public } from '../common/decorators';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private s: AuthService) {}

  @Public() @Post('register')
  register(@Body() d: RegisterDto) { return this.s.register(d); }

  @Public() @Post('login')
  login(@Body() d: LoginDto) { return this.s.login(d); }

  @Get('me')
  me(@CurrentUser() u: AuthUser) { return this.s.me(u.sub); }
}
