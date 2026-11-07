import { Body, Controller, HttpCode, Post, SetMetadata } from '@nestjs/common';
import { IS_PUBLIC } from '../common/decorators';
import { PasswordResetService } from './password-reset.service';

// Đánh dấu cả controller là public để JwtAuthGuard toàn cục cho qua
// (người quên mật khẩu thì chưa đăng nhập được)
@SetMetadata(IS_PUBLIC, true)
@Controller('auth')
export class PasswordResetController {
  constructor(private readonly svc: PasswordResetService) {}

  @Post('forgot-password')
  @HttpCode(200)
  forgot(@Body() b: { email?: string }) {
    return this.svc.requestOtp(b?.email);
  }

  @Post('verify-otp')
  @HttpCode(200)
  verify(@Body() b: { email?: string; otp?: string }) {
    return this.svc.verifyOtp(b?.email, b?.otp);
  }

  @Post('reset-password')
  @HttpCode(200)
  reset(@Body() b: { resetToken?: string; password?: string }) {
    return this.svc.resetPassword(b?.resetToken, b?.password);
  }
}