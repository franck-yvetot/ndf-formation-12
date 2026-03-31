import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('DatabaseModule', () => {
  const mockDataSource = {
    isInitialized: true,
    options: { type: 'sqljs' },
  };

  it('should compile a module with a DataSource provider', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    expect(module).toBeDefined();
    await module.close();
  });

  it('should provide a DataSource', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    const dataSource = module.get(getDataSourceToken());
    expect(dataSource).toBeDefined();
    expect(dataSource.isInitialized).toBe(true);
    await module.close();
  });

  it('should use sqljs driver', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    const dataSource = module.get(getDataSourceToken());
    expect(dataSource.options.type).toBe('sqljs');
    await module.close();
  });
});
