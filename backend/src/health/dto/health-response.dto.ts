import { ApiProperty } from '@nestjs/swagger';
import { IHealthResponse } from '@app/shared';

export class HealthResponseDto implements IHealthResponse {
  @ApiProperty({
    enum: ['ok', 'error'],
    description: 'Overall API status',
    example: 'ok',
  })
  status!: 'ok' | 'error';

  @ApiProperty({
    enum: ['ok', 'error'],
    description: 'Database connection status',
    example: 'ok',
  })
  database!: 'ok' | 'error';

  @ApiProperty({
    description: 'ISO 8601 timestamp of the response',
    example: '2026-03-31T15:00:00.000Z',
  })
  timestamp!: string;
}
