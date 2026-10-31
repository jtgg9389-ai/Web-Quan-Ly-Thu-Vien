import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync, hashSync } from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../common/role.enum';
import { isDuplicate, nextCode } from '../common/utils';
import { Reader, User } from '../entities';
import { LoginDto, RegisterDto } from './auth.dto';

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private ds: DataSource,
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {}

  private get refreshSecret() {
    return this.cfg.get<string>('JWT_REFRESH_SECRET') || this.cfg.get<string>('JWT_SECRET', 'dev_secret_change_me') + '_refresh';
  }
  get refreshDays() {
    return Number(this.cfg.get<string>('JWT_REFRESH_DAYS', '7')) || 7;
  }

  // Tạo access token (ngắn hạn) + refresh token (dài hạn), lưu băm refresh token để có thể thu hồi
  private async issue(u: User) {
    const readerId = u.reader?.id ?? null;
    const accessToken = this.jwt.sign({ sub: u.id, username: u.username, role: u.role, readerId });
    const refreshToken = this.jwt.sign(
      { sub: u.id, jti: randomUUID() },
      { secret: this.refreshSecret, expiresIn: `${this.refreshDays}d` },
    );
    await this.users.update(u.id, { refreshTokenHash: sha(refreshToken) });
    return {
      accessToken,
      refreshToken,
      user: { id: u.id, username: u.username, fullName: u.fullName, role: u.role, readerId },
    };
  }

  async register(d: RegisterDto) {
    if (await this.users.findOneBy({ username: d.username })) throw new ConflictException('Tên đăng nhập đã tồn tại');
    try {
      const user = await this.ds.transaction(async (m) => {
        const code = await nextCode(m.getRepository(Reader), 'R');
        const reader = await m.save(Reader, m.create(Reader, { code, fullName: d.fullName, phone: d.phone, address: d.address }));
        return m.save(User, m.create(User, {
          username: d.username, passwordHash: hashSync(d.password, 10), fullName: d.fullName, role: Role.Reader, reader,
        }));
      });
      return this.issue(user);
    } catch (e) {
      if (isDuplicate(e)) throw new ConflictException('Tên đăng nhập đã tồn tại');
      throw e;
    }
  }

  async login(d: LoginDto) {
    const user = await this.users.createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .leftJoinAndSelect('u.reader', 'r')
      .where('u.username = :n', { n: d.username })
      .getOne();
    if (!user || !compareSync(d.password, user.passwordHash)) throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    return this.issue(user);
  }

  // Đổi refresh token (từ cookie) lấy access token mới; refresh token cũ bị thay thế (rotation)
  async refresh(token?: string) {
    if (!token) throw new UnauthorizedException('Không có refresh token');
    let payload: { sub: number };
    try {
      payload = this.jwt.verify(token, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
    const user = await this.users.createQueryBuilder('u')
      .addSelect('u.refreshTokenHash')
      .leftJoinAndSelect('u.reader', 'r')
      .where('u.id = :id', { id: payload.sub })
      .getOne();
    if (!user || !user.refreshTokenHash || user.refreshTokenHash !== sha(token)) {
      throw new UnauthorizedException('Refresh token đã bị thu hồi, vui lòng đăng nhập lại');
    }
    return this.issue(user);
  }

  // Đăng xuất: thu hồi refresh token (bỏ qua nếu token không hợp lệ)
  async logout(token?: string) {
    if (token) {
      try {
        const p: { sub: number } = this.jwt.verify(token, { secret: this.refreshSecret });
        await this.users.update(p.sub, { refreshTokenHash: null });
      } catch { /* token hỏng/hết hạn: coi như đã đăng xuất */ }
    }
    return { message: 'Đã đăng xuất' };
  }

  async me(id: number) {
    const u = await this.users.findOne({ where: { id }, relations: { reader: true } });
    if (!u) throw new UnauthorizedException('Tài khoản không còn tồn tại');
    return { id: u.id, username: u.username, fullName: u.fullName, role: u.role, reader: u.reader };
  }
}
