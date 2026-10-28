import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book, Loan } from '../entities';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Loan])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
