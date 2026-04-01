import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExpenseReportsService } from './expense-reports.service';
import { CreateExpenseReportDto } from './dto/create-expense-report.dto';
import { UpdateExpenseReportDto } from './dto/update-expense-report.dto';
import { ExpenseReportResponseDto } from './dto/expense-report-response.dto';
import { PaginatedExpenseReportsResponseDto } from './dto/paginated-expense-reports-response.dto';
import { QueryExpenseReportsDto } from './dto/query-expense-reports.dto';
import { ExpenseReportStatus } from '../common/enums/expense-report-status.enum';

@ApiTags('Expense Reports')
@Controller('expense-reports')
export class ExpenseReportsController {
  constructor(
    private readonly expenseReportsService: ExpenseReportsService,
  ) {}

  // ─── POST / ────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new expense report' })
  @ApiResponse({
    status: 201,
    description: 'Expense report created successfully',
    type: ExpenseReportResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(
    @Body() dto: CreateExpenseReportDto,
  ): Promise<ExpenseReportResponseDto> {
    return this.expenseReportsService.create(dto) as Promise<ExpenseReportResponseDto>;
  }

  // ─── GET / ─────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'List expense reports with filters, pagination and sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of expense reports',
    type: PaginatedExpenseReportsResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search on purpose (LIKE)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ExpenseReportStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'reportDateFrom',
    required: false,
    type: String,
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'reportDateTo',
    required: false,
    type: String,
    example: '2026-12-31',
  })
  @ApiQuery({
    name: 'minTotalAmount',
    required: false,
    type: Number,
    example: 0,
  })
  @ApiQuery({
    name: 'maxTotalAmount',
    required: false,
    type: Number,
    example: 5000,
  })
  @ApiQuery({
    name: 'expenseCategories',
    required: false,
    type: String,
    description: 'Comma-separated categories (e.g. "HOTEL,RESTAURANT")',
    example: 'HOTEL,RESTAURANT',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['purpose', 'reportDate', 'totalAmount', 'status', 'createdAt', 'updatedAt'],
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  findAll(
    @Query() query: QueryExpenseReportsDto,
  ): Promise<PaginatedExpenseReportsResponseDto> {
    return this.expenseReportsService.findAll(query);
  }

  // ─── GET /:reportId ────────────────────────────────────────────────────────

  @Get(':reportId')
  @ApiOperation({ summary: 'Get a single expense report by ID' })
  @ApiParam({ name: 'reportId', type: String, description: 'Expense report UUID' })
  @ApiResponse({
    status: 200,
    description: 'Expense report found',
    type: ExpenseReportResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Expense report not found' })
  findOne(
    @Param('reportId') reportId: string,
  ): Promise<ExpenseReportResponseDto> {
    return this.expenseReportsService.findOne(reportId) as Promise<ExpenseReportResponseDto>;
  }

  // ─── PUT /:reportId ────────────────────────────────────────────────────────

  @Put(':reportId')
  @ApiOperation({ summary: 'Update an expense report (full update)' })
  @ApiParam({ name: 'reportId', type: String, description: 'Expense report UUID' })
  @ApiResponse({
    status: 200,
    description: 'Expense report updated',
    type: ExpenseReportResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Report cannot be modified in its current status',
  })
  @ApiResponse({ status: 404, description: 'Expense report not found' })
  update(
    @Param('reportId') reportId: string,
    @Body() dto: UpdateExpenseReportDto,
  ): Promise<ExpenseReportResponseDto> {
    return this.expenseReportsService.update(reportId, dto) as Promise<ExpenseReportResponseDto>;
  }

  // ─── PATCH /:reportId ──────────────────────────────────────────────────────

  @Patch(':reportId')
  @ApiOperation({ summary: 'Partially update an expense report' })
  @ApiParam({ name: 'reportId', type: String, description: 'Expense report UUID' })
  @ApiResponse({
    status: 200,
    description: 'Expense report partially updated',
    type: ExpenseReportResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Report cannot be modified in its current status',
  })
  @ApiResponse({ status: 404, description: 'Expense report not found' })
  patch(
    @Param('reportId') reportId: string,
    @Body() dto: UpdateExpenseReportDto,
  ): Promise<ExpenseReportResponseDto> {
    return this.expenseReportsService.update(reportId, dto) as Promise<ExpenseReportResponseDto>;
  }

  // ─── DELETE /:reportId ─────────────────────────────────────────────────────

  @Delete(':reportId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an expense report (cascade deletes expenses and attachments)' })
  @ApiParam({ name: 'reportId', type: String, description: 'Expense report UUID' })
  @ApiResponse({ status: 204, description: 'Expense report deleted' })
  @ApiResponse({ status: 404, description: 'Expense report not found' })
  remove(@Param('reportId') reportId: string): Promise<void> {
    return this.expenseReportsService.remove(reportId);
  }

  // ─── POST /:reportId/submit ────────────────────────────────────────────────

  @Post(':reportId/submit')
  @ApiOperation({
    summary:
      'Submit a report — changes status to SUBMITTED and marks all expenses as SUBMITTED',
  })
  @ApiParam({ name: 'reportId', type: String, description: 'Expense report UUID' })
  @ApiResponse({
    status: 201,
    description: 'Report submitted successfully',
    type: ExpenseReportResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Report already validated / denied / paid',
  })
  @ApiResponse({ status: 404, description: 'Expense report not found' })
  submit(
    @Param('reportId') reportId: string,
  ): Promise<ExpenseReportResponseDto> {
    return this.expenseReportsService.submit(reportId) as Promise<ExpenseReportResponseDto>;
  }
}
