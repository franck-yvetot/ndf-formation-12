import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { ExpenseStatus } from '../common/enums/expense-status.enum';
import { ExpenseReportStatus } from '../common/enums/expense-report-status.enum';
import { ExpenseReportsService } from '../expense-reports/expense-reports.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PaginatedExpensesResponseDto } from './dto/paginated-expenses-response.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly expenseReportsService: ExpenseReportsService,
  ) {}

  async create(reportId: string, dto: CreateExpenseDto): Promise<Expense> {
    const report = await this.expenseReportsService.findOne(reportId);

    if (
      report.status !== ExpenseReportStatus.CREATED &&
      report.status !== ExpenseReportStatus.SUBMITTED
    ) {
      throw new ForbiddenException(
        'Cannot add expense to a report with status: ' + report.status,
      );
    }

    const expenseDate =
      dto.expenseDate ??
      report.reportDate ??
      new Date().toISOString().split('T')[0];

    const expense = this.expenseRepository.create({
      expenseReportId: reportId,
      category: dto.category,
      amount: dto.amount,
      expenseName: dto.expenseName,
      description: dto.description ?? null,
      expenseDate,
      status: ExpenseStatus.CREATED,
    });

    const saved = await this.expenseRepository.save(expense);
    await this.expenseReportsService.recalculateTotalAmount(reportId);
    return saved;
  }

  async findAll(
    reportId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedExpensesResponseDto> {
    await this.expenseReportsService.findOne(reportId);

    const [data, total] = await this.expenseRepository.findAndCount({
      where: { expenseReportId: reportId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(reportId: string, expenseId: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id: expenseId, expenseReportId: reportId },
    });

    if (!expense) {
      throw new NotFoundException(
        `Expense with id "${expenseId}" not found in report "${reportId}"`,
      );
    }

    return expense;
  }

  async update(
    reportId: string,
    expenseId: string,
    dto: UpdateExpenseDto,
  ): Promise<Expense> {
    const report = await this.expenseReportsService.findOne(reportId);

    if (
      report.status === ExpenseReportStatus.VALIDATED ||
      report.status === ExpenseReportStatus.DENIED
    ) {
      throw new ForbiddenException(
        'Cannot modify expense: report is ' + report.status,
      );
    }

    const expense = await this.findOne(reportId, expenseId);

    if (
      expense.status === ExpenseStatus.ACCEPTED ||
      expense.status === ExpenseStatus.DENIED
    ) {
      throw new ForbiddenException(
        'Cannot modify expense with status: ' + expense.status,
      );
    }

    // Only apply defined fields (safe for PATCH: undefined keys are not overwritten)
    const updateData = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    ) as Partial<Expense>;

    Object.assign(expense, updateData);
    const saved = await this.expenseRepository.save(expense);
    await this.expenseReportsService.recalculateTotalAmount(reportId);
    return saved;
  }

  async remove(reportId: string, expenseId: string): Promise<void> {
    const expense = await this.findOne(reportId, expenseId);
    await this.expenseRepository.remove(expense);
    await this.expenseReportsService.recalculateTotalAmount(reportId);
  }
}
