import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Offer } from '../pricing/offering.service';
import type { RiskBand } from '../pricing/pricing.constants';
import { User } from '../users/user.entity';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => User, { nullable: false })
  user: User;

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

  @Column('numeric', { precision: 12, scale: 2 })
  systemPrice: number;

  @Column('numeric', { precision: 12, scale: 2 })
  principalAmount: number;

  @Column({ type: 'varchar', length: 1 })
  riskBand: RiskBand;

  @Column('numeric', { precision: 4, scale: 2 })
  apr: number;

  @Column('jsonb')
  offers: Offer[];

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
