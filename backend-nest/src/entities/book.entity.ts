import 'dotenv/config';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// Ảnh bìa có thể là data URL (ảnh tải lên) nên cần cột lớn: MySQL dùng MEDIUMTEXT, SQLite dùng TEXT
const BIG_TEXT: any = process.env.DB_TYPE === 'mysql' ? 'mediumtext' : 'text';

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

  // Ảnh bìa (link hoặc data URL)
  @Column({ type: BIG_TEXT, nullable: true })
  image: string | null;

  // Giới thiệu ngắn
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
