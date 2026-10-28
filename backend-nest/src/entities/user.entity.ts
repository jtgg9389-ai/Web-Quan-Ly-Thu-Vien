import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../common/role.enum';
import { Reader } from './reader.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  // select: false -> mặc định không trả mật khẩu khi truy vấn
  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ type: 'simple-enum', enum: Role, default: Role.Reader })
  role: Role;

  @OneToOne(() => Reader, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reader_id' })
  reader: Reader;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
