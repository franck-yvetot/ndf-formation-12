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
import { ExpenseReportResponseDto } from './dto/expense-report-response.dto';

@Injectable()
export class ExpenseReportsService {
  constructor(
    @InjectRepository(ExpenseReport)
    private readonly reportRepository: Repository<ExpenseReport>,
  ) {}

  async create(dto: CreateExpenseReportDto): Promise<ExpenseReport> {
    console.log('[ExpenseReportsService] Creating expense report:', dto);
    const report = this.reportRepository.create({
      purpose: dto.purpose,
      reportDate: dto.reportDate,
      status: ExpenseReportStatus.CREATED,
      totalAmount: 0,
      submittedAt: null,
    });
    const result = await this.reportRepository.save(report);
    console.log('[ExpenseReportsService] Expense report created with id:', result.id);
    return result;
  }

  async findAll(
    query: QueryExpenseReportsDto,
  ): Promise<PaginatedExpenseReportsResponseDto> {
    const qb = this.reportRepository.createQueryBuilder('report');

    // Always load the expenses relation so each report includes its expenses list
    qb.leftJoinAndSelect('report.expenses', 'expense');

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
      // The 'expense' alias is already joined above; only apply the WHERE filter
      const categories = query.expenseCategories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      qb.andWhere('expense.category IN (:...categories)', { categories });
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

    console.log('[ExpenseReportsService] Fetching expense reports with filters:', query);
    const [entities, total] = await qb.getManyAndCount();
    console.log('[ExpenseReportsService] Found', total, 'expense reports matching filters');

    return {
      data: entities.map((e) => ExpenseReportResponseDto.fromEntity(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Public endpoint: returns the mapped DTO (includes expenses). */
  async findOne(id: string): Promise<ExpenseReportResponseDto> {
    const report = await this.findOneEntity(id);
    return ExpenseReportResponseDto.fromEntity(report);
  }

  /** Internal helper: loads the raw ExpenseReport entity with its expenses. */
  private async findOneEntity(id: string): Promise<ExpenseReport> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['expenses'],
    });
    if (!report) {
      throw new NotFoundException(`Expense report with id "${id}" not found`);
    }
    return report;
  }

  async update(
    id: string,
    dto: UpdateExpenseReportDto,
  ): Promise<ExpenseReport> {
    const report = await this.findOneEntity(id);

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
    const report = await this.findOneEntity(id);
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
