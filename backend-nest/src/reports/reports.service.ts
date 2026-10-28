import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { diffDays, today } from '../common/utils';
import { Book, Loan, Reader } from '../entities';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Book) private books: Repository<Book>,
    @InjectRepository(Reader) private readers: Repository<Reader>,
    @InjectRepository(Loan) private loans: Repository<Loan>,
    private settings: SettingsService,
  ) {}

  async summary() {
    const fpd = await this.settings.getNumber('fine_per_day', 5000);
    const stock = await this.books.createQueryBuilder('b')
      .select('COALESCE(SUM(b.quantity),0)', 'copies').addSelect('COALESCE(SUM(b.available),0)', 'available').getRawOne();
    const collected = await this.loans.createQueryBuilder('l')
      .select('COALESCE(SUM(l.fineAmount),0)', 's').where('l.returnDate IS NOT NULL').getRawOne();
    const overdue = await this.loans.createQueryBuilder('l')
      .where('l.returnDate IS NULL AND l.dueDate < :t', { t: today() }).getMany();
    return {
      bookTitles: await this.books.count(),
      bookCopies: Number(stock.copies),
      availableCopies: Number(stock.available),
      borrowedCopies: Number(stock.copies) - Number(stock.available),
      readers: await this.readers.count(),
      activeLoans: Number(await this.loans.createQueryBuilder('l').where('l.returnDate IS NULL').getCount()),
      overdueLoans: overdue.length,
      pendingFines: overdue.reduce((s, l) => s + diffDays(today(), l.dueDate) * fpd, 0),
      collectedFines: Number(collected.s),
    };
  }

  async categories() {
    const rows = await this.books.createQueryBuilder('b')
      .select('b.category', 'category').addSelect('COUNT(b.id)', 'titles').addSelect('SUM(b.quantity)', 'copies')
      .groupBy('b.category').orderBy('SUM(b.quantity)', 'DESC').getRawMany();
    return rows.map((r) => ({ category: r.category, titles: Number(r.titles), copies: Number(r.copies) }));
  }

  async topBooks(limit = 5) {
    const rows = await this.loans.createQueryBuilder('l').innerJoin('l.book', 'b')
      .select('b.id', 'id').addSelect('b.title', 'title').addSelect('COUNT(l.id)', 'count')
      .groupBy('b.id').addGroupBy('b.title').orderBy('COUNT(l.id)', 'DESC').limit(limit).getRawMany();
    return rows.map((r) => ({ id: Number(r.id), title: r.title, count: Number(r.count) }));
  }

  // Gom theo tháng bằng JavaScript để chạy giống nhau trên MySQL và SQLite
  async loansByMonth() {
    const all = await this.loans.find({ select: { id: true, borrowDate: true } });
    const map: Record<string, number> = {};
    for (const l of all) map[l.borrowDate.slice(0, 7)] = (map[l.borrowDate.slice(0, 7)] || 0) + 1;
    return Object.keys(map).sort().map((month) => ({ month, count: map[month] }));
  }
}
