import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ExpenseReportStatus } from '../../common/enums/expense-report-status.enum';
import { Expense } from '../../expenses/entities/expense.entity';

@Entity('expense_reports')
export class ExpenseReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  purpose!: string;

  @Column({ type: 'date' })
  reportDate!: string;

  @Column({ type: 'varchar', default: ExpenseReportStatus.CREATED })
  @Index()
  status!: ExpenseReportStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount!: number;

  @Column({ type: 'datetime', nullable: true, default: null })
  submittedAt!: string | null;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Expense, (expense) => expense.expenseReport, {
    cascade: true,
    eager: false,
  })
  expenses!: Expense[];
}
