import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ExpenseReportStatus } from '../../common/enums/expense-report-status.enum';

export type SortByField =
  | 'purpose'
  | 'reportDate'
  | 'totalAmount'
  | 'status'
  | 'createdAt'
  | 'updatedAt';

const ALLOWED_SORT_FIELDS: SortByField[] = [
  'purpose',
  'reportDate',
  'totalAmount',
  'status',
  'createdAt',
  'updatedAt',
];

export class QueryExpenseReportsDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page (max 100)',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Full-text search on purpose (case-insensitive LIKE)',
    example: 'Paris',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by report status',
    enum: ExpenseReportStatus,
    example: ExpenseReportStatus.SUBMITTED,
  })
  @IsOptional()
  @IsEnum(ExpenseReportStatus)
  status?: ExpenseReportStatus;

  @ApiPropertyOptional({
    description: 'Filter reports with reportDate >= this date (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  reportDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter reports with reportDate <= this date (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  reportDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter reports with totalAmount >= this value',
    example: 100,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minTotalAmount?: number;

  @ApiPropertyOptional({
    description: 'Filter reports with totalAmount <= this value',
    example: 1000,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxTotalAmount?: number;

  @ApiPropertyOptional({
    description:
      'Filter reports containing at least one expense in these categories (comma-separated). Example: "HOTEL,RESTAURANT"',
    example: 'HOTEL,RESTAURANT',
  })
  @IsOptional()
  @IsString()
  expenseCategories?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ALLOWED_SORT_FIELDS,
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsOptional()
  @IsIn(ALLOWED_SORT_FIELDS)
  sortBy?: SortByField = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
