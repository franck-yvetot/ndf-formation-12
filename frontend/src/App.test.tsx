import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as healthApi from './api/health.api';

jest.mock('./api/health.api');

const mockHealthResponse = {
  status: 'ok' as const,
  database: 'ok' as const,
  timestamp: '2026-03-31T15:00:00.000Z',
};

describe('App', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render loading state initially', () => {
    (healthApi.fetchHealth as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<App />);

    expect(screen.getByText(/checking api status/i)).toBeInTheDocument();
  });

  it('should render success state when health check succeeds', async () => {
    (healthApi.fetchHealth as jest.Mock).mockResolvedValue(mockHealthResponse);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('API')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
    });

    expect(screen.getAllByText('✓ OK')).toHaveLength(2);
  });

  it('should render error state when health check fails', async () => {
    (healthApi.fetchHealth as jest.Mock).mockRejectedValue(
      new Error('Connection refused'),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/connection error/i)).toBeInTheDocument();
      expect(screen.getByText('Connection refused')).toBeInTheDocument();
    });
  });

  it('should render error state with unknown error message', async () => {
    (healthApi.fetchHealth as jest.Mock).mockRejectedValue('string error');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/unknown error/i)).toBeInTheDocument();
    });
  });

  it('should display the title', () => {
    (healthApi.fetchHealth as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<App />);

    expect(screen.getByText('Full-Stack Foundation')).toBeInTheDocument();
  });
});
