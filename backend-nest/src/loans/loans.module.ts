import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from '../entities';
import { SettingsModule } from '../settings/settings.module';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';

@Module({
  imports: [TypeOrmModule.forFeature([Loan]), SettingsModule],
  controllers: [LoansController],
  providers: [LoansService],
})
export class LoansModule {}
