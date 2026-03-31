import { useEffect, useState } from 'react';
import type { IHealthResponse } from '@app/shared';
import { fetchHealth } from './api/health.api';

type Status = 'loading' | 'success' | 'error';

function App() {
  const [status, setStatus] = useState<Status>('loading');
  const [health, setHealth] = useState<IHealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setHealth(data);
        setStatus('success');
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Full-Stack Foundation
        </h1>

        {status === 'loading' && (
          <p className="text-gray-500 animate-pulse">Checking API status…</p>
        )}

        {status === 'success' && health && (
          <div className="space-y-3">
            <StatusRow label="API" value={health.status} />
            <StatusRow label="Database" value={health.database} />
            <p className="text-xs text-gray-400 mt-4">
              Last checked: {new Date(health.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-600">
            <p className="font-semibold">Connection error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: 'ok' | 'error' }) {
  const isOk = value === 'ok';
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600 font-medium">{label}</span>
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          isOk
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {isOk ? '✓ OK' : '✗ Error'}
      </span>
    </div>
  );
}

export default App;
