import { ApiProperty } from '@nestjs/swagger';
import { ExpenseReportStatus } from '../../common/enums/expense-report-status.enum';
import { ExpenseCategory } from '../../common/enums/expense-category.enum';
import { ExpenseReport } from '../entities/expense-report.entity';

export class ExpenseInReportDto {
  @ApiProperty({
    description: 'Amount of the expense in EUR',
    example: 123.45,
    type: Number,
  })
  amount!: number;

  @ApiProperty({
    description: 'Category of the expense',
    enum: ExpenseCategory,
    example: ExpenseCategory.TRAVEL,
  })
  category!: ExpenseCategory;
}

export class ExpenseReportResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Purpose / reason for the expense report',
    example: 'Business trip to Paris — Q1 2026',
  })
  purpose!: string;

  @ApiProperty({
    description: 'Report date in YYYY-MM-DD format',
    example: '2026-04-01',
  })
  reportDate!: string;

  @ApiProperty({
    description: 'Current workflow status of the report',
    enum: ExpenseReportStatus,
    example: ExpenseReportStatus.CREATED,
  })
  status!: ExpenseReportStatus;

  @ApiProperty({
    description: 'Total amount in EUR (sum of all expenses)',
    example: 345.5,
    type: Number,
  })
  totalAmount!: number;

  @ApiProperty({
    description: 'ISO 8601 datetime when the report was submitted (null if not yet submitted)',
    example: '2026-04-02T10:00:00.000Z',
    nullable: true,
    type: String,
  })
  submittedAt!: string | null;

  @ApiProperty({
    description: 'ISO 8601 creation datetime',
    example: '2026-04-01T09:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'ISO 8601 last update datetime',
    example: '2026-04-01T09:00:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'List of expenses associated with this report',
    type: [ExpenseInReportDto],
  })
  expenses!: ExpenseInReportDto[];

  static fromEntity(entity: ExpenseReport): ExpenseReportResponseDto {
    const dto = new ExpenseReportResponseDto();
    dto.id = entity.id;
    dto.purpose = entity.purpose;
    dto.reportDate = entity.reportDate;
    dto.status = entity.status;
    dto.totalAmount = Number(entity.totalAmount);
    dto.submittedAt = entity.submittedAt;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.expenses = (entity.expenses ?? []).map((e) => {
      const expenseDto = new ExpenseInReportDto();
      expenseDto.amount = Number(e.amount);
      expenseDto.category = e.category;
      return expenseDto;
    });
    return dto;
  }
}
