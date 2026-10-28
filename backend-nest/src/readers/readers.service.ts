import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isDuplicate, nextCode, paging } from '../common/utils';
import { Loan, Reader } from '../entities';
import { CreateReaderDto, UpdateReaderDto } from './readers.dto';

@Injectable()
export class ReadersService {
  constructor(
    @InjectRepository(Reader) private repo: Repository<Reader>,
    @InjectRepository(Loan) private loans: Repository<Loan>,
  ) {}

  async findAll(q: Record<string, string>) {
    const { page, limit, skip } = paging(q);
    const qb = this.repo.createQueryBuilder('r');
    if (q.search) qb.andWhere('(r.code LIKE :s OR r.fullName LIKE :s OR r.phone LIKE :s OR r.address LIKE :s)', { s: `%${q.search}%` });
    const [data, total] = await qb.orderBy('r.id', 'ASC').skip(skip).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const r = await this.repo.findOneBy({ id });
    if (!r) throw new NotFoundException('Không tìm thấy độc giả');
    return r;
  }

  async create(d: CreateReaderDto) {
    try {
      const code = d.code?.trim() || (await nextCode(this.repo, 'R'));
      return await this.repo.save(this.repo.create({ ...d, code }));
    } catch (e) {
      if (isDuplicate(e)) throw new ConflictException('Mã độc giả đã tồn tại');
      throw e;
    }
  }

  async update(id: number, d: UpdateReaderDto) {
    const r = await this.findOne(id);
    Object.assign(r, d);
    try {
      return await this.repo.save(r);
    } catch (e) {
      if (isDuplicate(e)) throw new ConflictException('Mã độc giả đã tồn tại');
      throw e;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    if (await this.loans.count({ where: { reader: { id } } })) throw new ConflictException('Độc giả đã có phiếu mượn nên không thể xóa');
    await this.repo.delete(id);
    return { message: 'Đã xóa độc giả' };
  }
}
