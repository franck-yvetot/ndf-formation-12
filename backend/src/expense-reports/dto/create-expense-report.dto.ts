import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateExpenseReportDto {
  @ApiProperty({
    description: 'Purpose / reason for the expense report',
    example: 'Business trip to Paris — Q1 2026',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  purpose!: string;

  @ApiProperty({
    description: 'Report date in YYYY-MM-DD format',
    example: '2026-04-01',
    type: String,
  })
  @IsDateString()
  @IsNotEmpty()
  reportDate!: string;
}
