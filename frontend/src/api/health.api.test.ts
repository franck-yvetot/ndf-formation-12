import { fetchHealth } from './health.api';

const mockResponse = {
  status: 'ok' as const,
  database: 'ok' as const,
  timestamp: '2026-03-31T15:00:00.000Z',
};

describe('fetchHealth', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call the correct endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    await fetchHealth();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/health'),
    );
  });

  it('should return parsed IHealthResponse on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await fetchHealth();

    expect(result).toEqual(mockResponse);
    expect(result.status).toBe('ok');
    expect(result.database).toBe('ok');
    expect(result.timestamp).toBe('2026-03-31T15:00:00.000Z');
  });

  it('should throw an error when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    });

    await expect(fetchHealth()).rejects.toThrow(
      'Health check failed: 503 Service Unavailable',
    );
  });

  it('should throw when fetch itself rejects (network error)', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(fetchHealth()).rejects.toThrow('Network error');
  });
});
