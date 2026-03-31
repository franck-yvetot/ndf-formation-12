import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IHealthResponse } from '@app/shared';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  check(): IHealthResponse {
    const dbStatus = this.dataSource.isInitialized ? 'ok' : 'error';
    return {
      status: 'ok',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
