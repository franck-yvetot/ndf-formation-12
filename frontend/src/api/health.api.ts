import type { IHealthResponse } from '@app/shared';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function fetchHealth(): Promise<IHealthResponse> {
  const response = await fetch(`${API_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<IHealthResponse>;
}
