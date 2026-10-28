import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryColumn({ name: 'key_name', length: 50 })
  key: string;

  @Column({ length: 255 })
  value: string;
}
