import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ExpenseStatus } from '../../common/enums/expense-status.enum';
import { ExpenseCategory } from '../../common/enums/expense-category.enum';
import { ExpenseReport } from '../../expense-reports/entities/expense-report.entity';
import { ExpenseAttachment } from '../../expense-attachments/entities/expense-attachment.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  expenseReportId!: string;

  @Column({ type: 'varchar' })
  category!: ExpenseCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 255 })
  expenseName!: string;

  @Column({ type: 'text', nullable: true, default: null })
  description!: string | null;

  @Column({ type: 'date' })
  expenseDate!: string;

  @Column({ type: 'varchar', default: ExpenseStatus.CREATED })
  @Index()
  status!: ExpenseStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @ManyToOne(
    () => ExpenseReport,
    (report: ExpenseReport) => report.expenses,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'expenseReportId' })
  expenseReport!: ExpenseReport;

  @OneToMany(
    () => ExpenseAttachment,
    (attachment: ExpenseAttachment) => attachment.expense,
    { cascade: true },
  )
  attachments!: ExpenseAttachment[];
}
