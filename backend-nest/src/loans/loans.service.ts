import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuthUser } from '../common/decorators';
import { addDays, diffDays, nextCode, paging, today } from '../common/utils';
import { Book, Loan, Reader } from '../entities';
import { SettingsService } from '../settings/settings.service';
import { CreateLoanDto, ReturnLoanDto } from './loans.dto';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan) private repo: Repository<Loan>,
    private ds: DataSource,
    private settings: SettingsService,
  ) {}

  // Chuẩn hóa dữ liệu trả về, tính số ngày trễ và tiền phạt
  private view(l: Loan, finePerDay: number) {
    const lateDays = Math.max(0, diffDays(l.returnDate || today(), l.dueDate));
    return {
      id: l.id,
      code: l.code,
      reader: l.reader && { id: l.reader.id, code: l.reader.code, fullName: l.reader.fullName, phone: l.reader.phone },
      book: l.book && { id: l.book.id, code: l.book.code, title: l.book.title, author: l.book.author },
      borrowDate: l.borrowDate,
      dueDate: l.dueDate,
      returnDate: l.returnDate,
      lateDays,
      fineAmount: l.returnDate ? l.fineAmount : lateDays * finePerDay,
      status: l.returnDate ? 'returned' : lateDays > 0 ? 'overdue' : 'borrowing',
    };
  }

  // status: all | active (đang mượn) | returned | overdue (quá hạn)
  async findAll(q: Record<string, string>) {
    const { page, limit, skip } = paging(q);
    const fpd = await this.settings.getNumber('fine_per_day', 5000);
    const qb = this.repo.createQueryBuilder('l').leftJoinAndSelect('l.reader', 'r').leftJoinAndSelect('l.book', 'b');
    const st = q.status || 'all';
    if (st === 'active') qb.andWhere('l.returnDate IS NULL');
    else if (st === 'returned') qb.andWhere('l.returnDate IS NOT NULL');
    else if (st === 'overdue') qb.andWhere('l.returnDate IS NULL AND l.dueDate < :t', { t: today() });
    if (q.readerId) qb.andWhere('r.id = :rid', { rid: Number(q.readerId) });
    if (q.search) qb.andWhere('(l.code LIKE :s OR r.fullName LIKE :s OR b.title LIKE :s)', { s: `%${q.search}%` });
    const [rows, total] = await qb.orderBy('l.id', 'DESC').skip(skip).take(limit).getManyAndCount();
    return { data: rows.map((l) => this.view(l, fpd)), total, page, limit };
  }

  findMine(readerId: number | null) {
    if (!readerId) return { data: [], total: 0, page: 1, limit: 500 };
    return this.findAll({ readerId: String(readerId), limit: '500' });
  }

  // Lập phiếu mượn: trừ số lượng sách trong cùng một transaction
  async create(d: CreateLoanDto, user: AuthUser) {
    const days = d.days ?? (await this.settings.getNumber('loan_days', 14));
    const fpd = await this.settings.getNumber('fine_per_day', 5000);
    const borrowDate = d.borrowDate || today();
    const dueDate = addDays(borrowDate, days);

    return this.ds.transaction(async (m) => {
      const reader = await m.findOne(Reader, { where: { id: d.readerId } });
      if (!reader) throw new NotFoundException('Không tìm thấy độc giả');
      const book = await m.findOne(Book, { where: { id: d.bookId } });
      if (!book) throw new NotFoundException('Không tìm thấy sách');

      // Cập nhật nguyên tử: chỉ trừ khi còn sách, tránh hai người mượn cùng lúc cuốn cuối
      const upd = await m.createQueryBuilder().update(Book)
        .set({ available: () => 'available - 1' })
        .where('id = :id AND available > 0', { id: book.id })
        .execute();
      if (!upd.affected) throw new BadRequestException(`Sách "${book.title}" đã hết`);

      const code = await nextCode(m.getRepository(Loan), 'P');
      const loan = await m.save(Loan, m.create(Loan, {
        code, reader, book, borrowDate, dueDate, returnDate: null, fineAmount: 0, createdBy: { id: user.sub } as any,
      }));
      return this.view(loan, fpd);
    });
  }

  // Lập phiếu trả: ghi ngày trả, tính tiền phạt, cộng lại số lượng sách
  async giveBack(id: number, d: ReturnLoanDto) {
    const fpd = await this.settings.getNumber('fine_per_day', 5000);
    return this.ds.transaction(async (m) => {
      const loan = await m.findOne(Loan, { where: { id }, relations: { reader: true, book: true } });
      if (!loan) throw new NotFoundException('Không tìm thấy phiếu mượn');
      if (loan.returnDate) throw new BadRequestException('Phiếu này đã được trả');

      const returnDate = d.returnDate || today();
      if (returnDate < loan.borrowDate) throw new BadRequestException('Ngày trả không được trước ngày mượn');
      const fine = Math.max(0, diffDays(returnDate, loan.dueDate)) * fpd;

      const upd = await m.createQueryBuilder().update(Loan)
        .set({ returnDate, fineAmount: fine })
        .where('id = :id AND return_date IS NULL', { id })
        .execute();
      if (!upd.affected) throw new BadRequestException('Phiếu này đã được trả');

      await m.createQueryBuilder().update(Book)
        .set({ available: () => 'available + 1' })
        .where('id = :id', { id: loan.book.id })
        .execute();

      loan.returnDate = returnDate;
      loan.fineAmount = fine;
      return this.view(loan, fpd);
    });
  }
}
