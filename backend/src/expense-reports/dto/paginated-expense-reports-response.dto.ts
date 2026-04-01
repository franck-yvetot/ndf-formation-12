import { ApiProperty } from '@nestjs/swagger';
import { ExpenseReportResponseDto } from './expense-report-response.dto';

export class PaginatedExpenseReportsResponseDto {
  @ApiProperty({
    description: 'Array of expense reports for the current page',
    type: [ExpenseReportResponseDto],
  })
  data!: ExpenseReportResponseDto[];

  @ApiProperty({
    description: 'Total number of expense reports matching the filters',
    example: 42,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages!: number;
}
