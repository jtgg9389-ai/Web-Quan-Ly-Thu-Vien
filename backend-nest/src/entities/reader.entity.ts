import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('readers')
export class Reader {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  code: string;

  @Index()
  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Index()
  @Column({ length: 20 })
  phone: string;

  @Column({ length: 255 })
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
