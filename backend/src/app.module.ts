import { join } from 'path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ExpenseReportsModule } from './expense-reports/expense-reports.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ExpenseAttachmentsModule } from './expense-attachments/expense-attachments.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    ExpenseReportsModule,
    ExpensesModule,
    ExpenseAttachmentsModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
})
export class AppModule {}
