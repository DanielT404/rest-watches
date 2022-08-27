import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

@Entity({
  name: 'watches'
})
@Index(['manufacturer', 'model', 'bracelet_color'], { unique: true })
export class Watch {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('idx_manufacturer')
  @Column('varchar', { length: 50, nullable: false })
  manufacturer: string;

  @Index('idx_model')
  @Column('varchar', { length: 50, nullable: false })
  model: string;

  @Index('idx_bracelet_color')
  @Column('varchar', { length: 25, nullable: false })
  bracelet_color: string;

  @Column('date', { nullable: true })
  launch_date_iso8601: string | null;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: false
  })
  price: string;

  @Index('idx_price_currency_iso4217')
  @Column('char', { length: 3, nullable: false })
  price_currency_iso4217: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: string;
}
