import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let mockDataSource: { isInitialized: boolean };

  beforeEach(async () => {
    mockDataSource = {
      isInitialized: true,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check()', () => {
    it('should return status "ok" and database "ok" when DataSource is initialized', () => {
      mockDataSource.isInitialized = true;

      const result = service.check();

      expect(result.status).toBe('ok');
      expect(result.database).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should return database "error" when DataSource is not initialized', () => {
      mockDataSource.isInitialized = false;

      const result = service.check();

      expect(result.status).toBe('ok');
      expect(result.database).toBe('error');
    });

    it('should return a valid ISO 8601 timestamp', () => {
      const result = service.check();
      const date = new Date(result.timestamp);
      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(false);
    });
  });
});
