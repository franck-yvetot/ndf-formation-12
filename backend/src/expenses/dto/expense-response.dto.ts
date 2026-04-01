import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategory } from '../../common/enums/expense-category.enum';
import { ExpenseStatus } from '../../common/enums/expense-status.enum';

export class ExpenseResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  expenseReportId!: string;

  @ApiProperty({ enum: ExpenseCategory, enumName: 'ExpenseCategory' })
  category!: ExpenseCategory;

  @ApiProperty({ example: 42.5 })
  amount!: number;

  @ApiProperty({ example: 'Team lunch' })
  expenseName!: string;

  @ApiProperty({
    nullable: true,
    example: 'Monthly team lunch for Q1',
  })
  description!: string | null;

  @ApiProperty({ example: '2024-03-15' })
  expenseDate!: string;

  @ApiProperty({ enum: ExpenseStatus, enumName: 'ExpenseStatus' })
  status!: ExpenseStatus;

  @ApiProperty({ example: '2024-03-15T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-03-15T10:00:00.000Z' })
  updatedAt!: Date;
}
