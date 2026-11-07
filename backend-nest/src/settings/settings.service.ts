import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../entities';

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(Setting) private repo: Repository<Setting>) {}

  async getNumber(key: string, def: number) {
    const s = await this.repo.findOneBy({ key });
    const n = Number(s?.value);
    return s && Number.isFinite(n) ? n : def;
  }

  async getAll() {
    return {
      loanDays: await this.getNumber('loan_days', 14),
      finePerDay: await this.getNumber('fine_per_day', 5000),
    };
  }

  async update(d: { loanDays?: number; finePerDay?: number }) {
    if (d.loanDays != null) await this.repo.save({ key: 'loan_days', value: String(d.loanDays) });
    if (d.finePerDay != null) await this.repo.save({ key: 'fine_per_day', value: String(d.finePerDay) });
    return this.getAll();
  }
}
