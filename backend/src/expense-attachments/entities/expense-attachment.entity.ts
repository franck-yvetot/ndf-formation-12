import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Expense } from '../../expenses/entities/expense.entity';

@Entity('expense_attachments')
export class ExpenseAttachment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  expenseId!: string;

  @Column({ type: 'varchar', length: 512 })
  originalName!: string;

  @Column({ type: 'varchar', length: 512 })
  fileName!: string;

  @Column({ type: 'varchar', length: 128 })
  mimeType!: string;

  @Column({ type: 'integer' })
  size!: number;

  @Column({ type: 'varchar', length: 16 })
  extension!: string;

  @Column({ type: 'varchar', length: 1024 })
  storagePath!: string;

  @Column({ type: 'varchar', length: 1024 })
  url!: string;

  @CreateDateColumn()
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Expense, (expense) => expense.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'expenseId' })
  expense!: Expense;
}
