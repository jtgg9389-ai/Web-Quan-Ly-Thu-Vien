/**
 * Cấu hình cho khớp project (đã điền sẵn theo entity User của bạn).
 */
import * as bcrypt from 'bcryptjs'; // nếu auth.service.ts dùng 'bcrypt' thì đổi thành: import * as bcrypt from 'bcrypt';

// 1) Entity dùng để đăng nhập
export { User as UserEntity } from '../entities/user.entity';

// 2) Tên PROPERTY trong entity User
export const ID_FIELD = 'id';
export const EMAIL_FIELD = 'email';
export const PASSWORD_FIELD = 'passwordHash';
export const REFRESH_TOKEN_FIELD = 'refreshTokenHash'; // đổi mật khẩu xong sẽ thu hồi đăng nhập cũ

// 3) Cách băm mật khẩu - phải giống lúc đăng ký/đăng nhập
export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);

// 4) Thông số OTP
export const OTP_TTL_MS = 5 * 60 * 1000; // hiệu lực 5 phút
export const OTP_MAX_ATTEMPTS = 5; // sai tối đa 5 lần
export const OTP_RESEND_MS = 60 * 1000; // 60s mới được xin mã mới