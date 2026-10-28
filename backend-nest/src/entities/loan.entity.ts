import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from './book.entity';
import { Reader } from './reader.entity';
import { User } from './user.entity';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  code: string;

  @ManyToOne(() => Reader, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'reader_id' })
  reader: Reader;

  @ManyToOne(() => Book, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @Column({ name: 'borrow_date', type: 'date' })
  borrowDate: string;

  @Index()
  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Index()
  @Column({ name: 'return_date', type: 'date', nullable: true })
  returnDate: string | null;

  @Column({ name: 'fine_amount', type: 'int', unsigned: true, default: 0 })
  fineAmount: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
