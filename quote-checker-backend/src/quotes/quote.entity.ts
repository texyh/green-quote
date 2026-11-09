import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
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

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
