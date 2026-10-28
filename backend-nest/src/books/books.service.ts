import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isDuplicate, nextCode, paging } from '../common/utils';
import { Book, Loan } from '../entities';
import { CreateBookDto, UpdateBookDto } from './books.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private repo: Repository<Book>,
    @InjectRepository(Loan) private loans: Repository<Loan>,
  ) {}

  async findAll(q: Record<string, string>) {
    const { page, limit, skip } = paging(q);
    const qb = this.repo.createQueryBuilder('b');
    if (q.search) qb.andWhere('(b.code LIKE :s OR b.title LIKE :s OR b.author LIKE :s OR b.category LIKE :s)', { s: `%${q.search}%` });
    if (q.category) qb.andWhere('b.category = :c', { c: q.category });
    const [data, total] = await qb.orderBy('b.id', 'ASC').skip(skip).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const b = await this.repo.findOneBy({ id });
    if (!b) throw new NotFoundException('Không tìm thấy sách');
    return b;
  }

  async create(d: CreateBookDto) {
    try {
      const code = d.code?.trim() || (await nextCode(this.repo, 'B'));
      return await this.repo.save(this.repo.create({ ...d, code, available: d.quantity }));
    } catch (e) {
      if (isDuplicate(e)) throw new ConflictException('Mã sách đã tồn tại');
      throw e;
    }
  }

  async update(id: number, d: UpdateBookDto) {
    const b = await this.findOne(id);
    if (d.quantity !== undefined) {
      const borrowed = b.quantity - b.available;
      if (d.quantity < borrowed) throw new BadRequestException(`Số lượng không được nhỏ hơn số sách đang cho mượn (${borrowed})`);
      b.available = d.quantity - borrowed;
    }
    Object.assign(b, d);
    try {
      return await this.repo.save(b);
    } catch (e) {
      if (isDuplicate(e)) throw new ConflictException('Mã sách đã tồn tại');
      throw e;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    if (await this.loans.count({ where: { book: { id } } })) throw new ConflictException('Sách đã có phiếu mượn nên không thể xóa');
    await this.repo.delete(id);
    return { message: 'Đã xóa sách' };
  }
}
