import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import type { IHealthResponse } from '@app/shared';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockHealthResponse: IHealthResponse = {
    status: 'ok',
    database: 'ok',
    timestamp: '2026-03-31T15:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: jest.fn().mockReturnValue(mockHealthResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth()', () => {
    it('should call HealthService.check()', () => {
      controller.getHealth();
      expect(service.check).toHaveBeenCalledTimes(1);
    });

    it('should return the result from HealthService.check()', () => {
      const result = controller.getHealth();
      expect(result).toEqual(mockHealthResponse);
    });

    it('should return an object with status, database and timestamp', () => {
      const result = controller.getHealth();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('database');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return status "ok" in the happy path', () => {
      const result = controller.getHealth();
      expect(result.status).toBe('ok');
    });

    it('should propagate "error" database status from service', () => {
      (service.check as jest.Mock).mockReturnValue({
        ...mockHealthResponse,
        database: 'error',
      });
      const result = controller.getHealth();
      expect(result.database).toBe('error');
    });
  });
});
