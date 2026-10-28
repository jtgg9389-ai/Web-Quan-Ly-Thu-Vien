import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  code: string;

  @Index()
  @Column({ length: 200 })
  title: string;

  @Index()
  @Column({ length: 100 })
  author: string;

  @Index()
  @Column({ length: 50 })
  category: string;

  // Tổng số bản
  @Column({ type: 'int', unsigned: true, default: 1 })
  quantity: number;

  // Số bản còn lại (tự cập nhật khi mượn/trả)
  @Column({ type: 'int', unsigned: true, default: 1 })
  available: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
