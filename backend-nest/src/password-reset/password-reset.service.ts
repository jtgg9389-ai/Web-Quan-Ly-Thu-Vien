import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import { Repository } from 'typeorm';
import { MailService } from './mail.service';
import { PasswordOtp } from './password-otp.entity';
import {
  EMAIL_FIELD, ID_FIELD, OTP_MAX_ATTEMPTS, OTP_RESEND_MS, OTP_TTL_MS,
  PASSWORD_FIELD, REFRESH_TOKEN_FIELD, UserEntity, hashPassword,
} from './password-reset.config';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const OTP_SECRET = () => process.env.JWT_SECRET || 'dev-secret';
const RESET_SECRET = () => process.env.JWT_RESET_SECRET || process.env.JWT_SECRET || 'dev-secret';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<any>,
    @InjectRepository(PasswordOtp) private readonly otps: Repository<PasswordOtp>,
    private readonly mail: MailService,
    private readonly jwt: JwtService,
  ) {}

  private hashOtp(email: string, otp: string) {
    return createHmac('sha256', OTP_SECRET()).update(`${email}:${otp}`).digest('hex');
  }

  private findUser(email: string) {
    return this.users
      .createQueryBuilder('u')
      .addSelect(`u.${PASSWORD_FIELD}`) // cột mật khẩu có select:false nên phải chọn thủ công
      .where(`LOWER(u.${EMAIL_FIELD}) = :email`, { email })
      .getOne();
  }

  private normEmail(v: unknown) {
    const email = String(v ?? '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) throw new BadRequestException('Email không hợp lệ.');
    return email;
  }

  /** Bước 1: tạo OTP và gửi về Gmail. Luôn trả kết quả giống nhau để không lộ email nào tồn tại. */
  async requestOtp(emailRaw: unknown) {
    const email = this.normEmail(emailRaw);
    const user = await this.findUser(email);
    const last = await this.otps.findOne({ where: { email }, order: { id: 'DESC' } });
    const tooSoon = last && Date.now() - last.createdAt.getTime() < OTP_RESEND_MS;

    if (user && !tooSoon) {
      const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');
      await this.otps.update({ email, used: false }, { used: true });
      await this.otps.save(
        this.otps.create({
          email,
          otpHash: this.hashOtp(email, otp),
          expiresAt: new Date(Date.now() + OTP_TTL_MS),
        }),
      );
      await this.mail.sendOtp(email, otp);
    }
    return { message: 'Nếu email tồn tại, mã OTP đã được gửi. Vui lòng kiểm tra Gmail.' };
  }

  /** Bước 2: kiểm tra OTP, đúng thì trả resetToken (sống 10 phút, dùng được 1 lần). */
  async verifyOtp(emailRaw: unknown, otpRaw: unknown) {
    const email = this.normEmail(emailRaw);
    const otp = String(otpRaw ?? '').trim();
    const row = await this.otps.findOne({ where: { email, used: false }, order: { id: 'DESC' } });

    if (!row || row.expiresAt.getTime() < Date.now() || row.attempts >= OTP_MAX_ATTEMPTS) {
      throw new BadRequestException('Mã OTP đã hết hạn hoặc bị khóa. Hãy yêu cầu mã mới.');
    }
    const expected = Buffer.from(row.otpHash);
    const actual = Buffer.from(this.hashOtp(email, otp));
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      row.attempts += 1;
      await this.otps.save(row);
      throw new BadRequestException(`OTP sai. Còn ${Math.max(OTP_MAX_ATTEMPTS - row.attempts, 0)} lần thử.`);
    }
    row.used = true;
    await this.otps.save(row);

    const user = await this.findUser(email);
    if (!user) throw new BadRequestException('Tài khoản không tồn tại.');
    // Ký bằng secret + mật khẩu hiện tại: đổi mật khẩu xong token tự vô hiệu (dùng 1 lần)
    const resetToken = await this.jwt.signAsync(
      { email, purpose: 'reset' },
      { secret: RESET_SECRET() + user[PASSWORD_FIELD], expiresIn: '10m' },
    );
    return { resetToken };
  }

  /** Bước 3: đặt mật khẩu mới. */
  async resetPassword(resetToken: unknown, newPassword: unknown) {
    const password = String(newPassword ?? '');
    if (password.length < 8) throw new BadRequestException('Mật khẩu tối thiểu 8 ký tự.');

    const invalid = new UnauthorizedException('Phiên khôi phục đã hết hạn, hãy làm lại từ đầu.');
    const token = String(resetToken ?? '');
    const decoded = this.jwt.decode(token) as { email?: string } | null;
    if (!decoded?.email) throw invalid;
    const user = await this.findUser(decoded.email);
    if (!user) throw invalid;

    try {
      const p = await this.jwt.verifyAsync<{ purpose?: string }>(token, {
        secret: RESET_SECRET() + user[PASSWORD_FIELD],
      });
      if (p.purpose !== 'reset') throw invalid;
    } catch {
      throw invalid;
    }

    await this.users.update(user[ID_FIELD], {
      [PASSWORD_FIELD]: await hashPassword(password),
      [REFRESH_TOKEN_FIELD]: null, // buộc đăng nhập lại trên mọi thiết bị
    });
    await this.otps.update({ email: decoded.email }, { used: true });
    return { message: 'Đổi mật khẩu thành công.' };
  }
}