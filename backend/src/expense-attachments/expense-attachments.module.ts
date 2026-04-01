import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseAttachment } from './entities/expense-attachment.entity';
import { ExpenseAttachmentsController } from './expense-attachments.controller';
import { ExpenseAttachmentsService } from './expense-attachments.service';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseAttachment]),
    ExpensesModule, // provides ExpensesService
  ],
  controllers: [ExpenseAttachmentsController],
  providers: [ExpenseAttachmentsService],
})
export class ExpenseAttachmentsModule {}
