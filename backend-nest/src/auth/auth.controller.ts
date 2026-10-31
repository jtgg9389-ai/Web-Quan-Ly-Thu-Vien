import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthUser, CurrentUser, Public } from '../common/decorators';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

const COOKIE = 'refresh_token';
const COOKIE_PATH = '/api/auth';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private s: AuthService) {}

  private setCookie(res: Response, token: string) {
    res.cookie(COOKIE, token, {
      httpOnly: true, // JavaScript phía trình duyệt không đọc được -> chống XSS đánh cắp token
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: COOKIE_PATH,
      maxAge: this.s.refreshDays * 864e5,
    });
  }

  @Public()
  @ApiOperation({ summary: 'Đăng ký tài khoản độc giả, trả về access token và set refresh token vào cookie' })
  @Post('register')
  async register(@Body() d: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { refreshToken, ...out } = await this.s.register(d);
    this.setCookie(res, refreshToken);
    return out;
  }

  @Public()
  @ApiOperation({ summary: 'Đăng nhập, trả về access token và set refresh token vào cookie' })
  @Post('login')
  async login(@Body() d: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { refreshToken, ...out } = await this.s.login(d);
    this.setCookie(res, refreshToken);
    return out;
  }

  @Public()
  @ApiOperation({ summary: 'Cấp access token mới từ refresh token trong cookie' })
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { refreshToken, ...out } = await this.s.refresh(req.cookies?.[COOKIE]);
    this.setCookie(res, refreshToken);
    return out;
  }

  @Public()
  @ApiOperation({ summary: 'Đăng xuất, thu hồi refresh token và xoá cookie' })
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE, { path: COOKIE_PATH });
    return this.s.logout(req.cookies?.[COOKIE]);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại từ access token' })
  @Get('me')
  me(@CurrentUser() u: AuthUser) { return this.s.me(u.sub); }
}
