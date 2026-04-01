import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseReport } from './entities/expense-report.entity';
import { ExpenseReportStatus } from '../common/enums/expense-report-status.enum';
import { ExpenseStatus } from '../common/enums/expense-status.enum';
import { CreateExpenseReportDto } from './dto/create-expense-report.dto';
import { UpdateExpenseReportDto } from './dto/update-expense-report.dto';
import { QueryExpenseReportsDto } from './dto/query-expense-reports.dto';
import { PaginatedExpenseReportsResponseDto } from './dto/paginated-expense-reports-response.dto';

@Injectable()
export class ExpenseReportsService {
  constructor(
    @InjectRepository(ExpenseReport)
    private readonly reportRepository: Repository<ExpenseReport>,
  ) {}

  async create(dto: CreateExpenseReportDto): Promise<ExpenseReport> {
    const report = this.reportRepository.create({
      purpose: dto.purpose,
      reportDate: dto.reportDate,
      status: ExpenseReportStatus.CREATED,
      totalAmount: 0,
      submittedAt: null,
    });
    return this.reportRepository.save(report);
  }

  async findAll(
    query: QueryExpenseReportsDto,
  ): Promise<PaginatedExpenseReportsResponseDto> {
    const qb = this.reportRepository.createQueryBuilder('report');

    if (query.search) {
      qb.andWhere('report.purpose LIKE :search', {
        search: `%${query.search}%`,
      });
    }

    if (query.status) {
      qb.andWhere('report.status = :status', { status: query.status });
    }

    if (query.reportDateFrom) {
      qb.andWhere('report.reportDate >= :dateFrom', {
        dateFrom: query.reportDateFrom,
      });
    }

    if (query.reportDateTo) {
      qb.andWhere('report.reportDate <= :dateTo', {
        dateTo: query.reportDateTo,
      });
    }

    if (query.minTotalAmount !== undefined) {
      qb.andWhere('report.totalAmount >= :minAmount', {
        minAmount: query.minTotalAmount,
      });
    }

    if (query.maxTotalAmount !== undefined) {
      qb.andWhere('report.totalAmount <= :maxAmount', {
        maxAmount: query.maxTotalAmount,
      });
    }

    if (query.expenseCategories) {
      const categories = query.expenseCategories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      qb.leftJoin('report.expenses', 'expense').andWhere(
        'expense.category IN (:...categories)',
        { categories },
      );
      qb.groupBy('report.id');
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = (
      query.sortOrder ?? 'desc'
    ).toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(`report.${sortBy}`, sortOrder);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ExpenseReport> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Expense report with id "${id}" not found`);
    }
    return report;
  }

  async update(
    id: string,
    dto: UpdateExpenseReportDto,
  ): Promise<ExpenseReport> {
    const report = await this.findOne(id);

    if (
      report.status === ExpenseReportStatus.VALIDATED ||
      report.status === ExpenseReportStatus.DENIED
    ) {
      throw new ForbiddenException(
        'Report cannot be modified in its current status',
      );
    }

    Object.assign(report, dto);
    return this.reportRepository.save(report);
  }

  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);
    await this.reportRepository.remove(report);
  }

  async submit(id: string): Promise<ExpenseReport> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['expenses'],
    });

    if (!report) {
      throw new NotFoundException(`Expense report with id "${id}" not found`);
    }

    if (
      report.status === ExpenseReportStatus.VALIDATED ||
      report.status === ExpenseReportStatus.DENIED ||
      report.status === ExpenseReportStatus.PAID
    ) {
      throw new ForbiddenException(
        'Report cannot be modified in its current status',
      );
    }

    report.status = ExpenseReportStatus.SUBMITTED;
    report.submittedAt = new Date().toISOString();

    if (report.expenses && report.expenses.length > 0) {
      for (const expense of report.expenses) {
        expense.status = ExpenseStatus.SUBMITTED;
      }
    }

    return this.reportRepository.save(report);
  }

  async recalculateTotalAmount(reportId: string): Promise<void> {
    const result = await this.reportRepository
      .createQueryBuilder('report')
      .leftJoin('report.expenses', 'expense')
      .select('SUM(expense.amount)', 'sum')
      .where('report.id = :id', { id: reportId })
      .getRawOne<{ sum: string | null }>();

    const total = parseFloat(result?.sum ?? '0') || 0;

    await this.reportRepository.update(reportId, { totalAmount: total });
  }
}
