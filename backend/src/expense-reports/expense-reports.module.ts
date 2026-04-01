import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseReport } from './entities/expense-report.entity';
import { ExpenseReportsController } from './expense-reports.controller';
import { ExpenseReportsService } from './expense-reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseReport])],
  controllers: [ExpenseReportsController],
  providers: [ExpenseReportsService],
  exports: [ExpenseReportsService],
})
export class ExpenseReportsModule {}
