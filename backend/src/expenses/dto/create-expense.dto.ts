import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ExpenseCategory } from '../../common/enums/expense-category.enum';

export class CreateExpenseDto {
  @ApiProperty({ enum: ExpenseCategory, enumName: 'ExpenseCategory' })
  @IsEnum(ExpenseCategory)
  @IsNotEmpty()
  category!: ExpenseCategory;

  @ApiProperty({ example: 42.5, minimum: 0.01 })
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({ example: 'Team lunch', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  expenseName!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Monthly team lunch for Q1',
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    required: false,
    example: '2024-03-15',
    description: 'Defaults to report reportDate or today if not provided',
  })
  @IsDateString()
  @IsOptional()
  expenseDate?: string;
}
