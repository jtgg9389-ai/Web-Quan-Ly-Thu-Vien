import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan, Reader } from '../entities';
import { ReadersController } from './readers.controller';
import { ReadersService } from './readers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reader, Loan])],
  controllers: [ReadersController],
  providers: [ReadersService],
})
export class ReadersModule {}
