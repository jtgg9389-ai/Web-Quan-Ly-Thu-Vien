import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { OTP_TTL_MS } from './password-reset.config';

@Injectable()
export class MailService {
  private readonly log = new Logger(MailService.name);

  async sendOtp(to: string, otp: string): Promise<void> {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    // Chưa cấu hình Gmail -> in OTP ra terminal để test
    if (!user || !pass) {
      this.log.warn(`[DEV] Chưa cấu hình Gmail. OTP cho ${to}: ${otp}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    try {
      await transporter.sendMail({
        from: `"Quản lý thư viện" <${user}>`,
        to,
        subject: 'Mã OTP khôi phục mật khẩu',
        text:
          `Mã OTP khôi phục mật khẩu của bạn là: ${otp}\n\n` +
          `Mã có hiệu lực trong ${OTP_TTL_MS / 60000} phút. Không chia sẻ mã này cho bất kỳ ai.\n` +
          `Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
      });
    } catch (e) {
      this.log.error('Lỗi gửi mail', e as Error);
      throw new InternalServerErrorException('Không gửi được email, vui lòng thử lại sau.');
    }
  }
}
