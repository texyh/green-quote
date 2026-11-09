import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Index()
  @Column()
  email: string;

  @Column()
  address: string;

  @Column('numeric')
  monthlyConsumptionKwh: number;

  @Column('numeric')
  systemSizeKw: number;

  @Column('numeric', { default: 0 })
  downPayment: number;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
