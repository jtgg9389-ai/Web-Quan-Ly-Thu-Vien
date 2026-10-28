import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync, hashSync } from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../common/role.enum';
import { isDuplicate, nextCode } from '../common/utils';
import { Reader, User } from '../entities';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private ds: DataSource,
    private jwt: JwtService,
  ) {}

  private issue(u: User) {
    const readerId = u.reader?.id ?? null;
    const payload = { sub: u.id, username: u.username, role: u.role, readerId };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: u.id, username: u.username, fullName: u.fullName, role: u.role, readerId },
    };
  }

  // Đăng ký: tạo hồ sơ độc giả + tài khoản vai trò reader
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

  async me(id: number) {
    const u = await this.users.findOne({ where: { id }, relations: { reader: true } });
    if (!u) throw new UnauthorizedException('Tài khoản không còn tồn tại');
    return { id: u.id, username: u.username, fullName: u.fullName, role: u.role, reader: u.reader };
  }
}
