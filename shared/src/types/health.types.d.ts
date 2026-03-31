/**
 * Shared health check response interface.
 * Used by both backend (DTO) and frontend (API client).
 */
export interface IHealthResponse {
    /** Overall API status */
    status: 'ok' | 'error';
    /** Database connection status */
    database: 'ok' | 'error';
    /** ISO 8601 timestamp of the response */
    timestamp: string;
}
//# sourceMappingURL=health.types.d.ts.map