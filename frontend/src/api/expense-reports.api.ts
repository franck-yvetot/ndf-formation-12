import type {
  ICreateExpenseReportPayload,
  IExpenseReport,
  IExpenseReportQuery,
  IPaginatedExpenseReports,
} from '../types/expense-report.types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function fetchExpenseReports(
  query: IExpenseReportQuery = {},
): Promise<IPaginatedExpenseReports> {
  const params = new URLSearchParams();

  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.status) params.set('status', query.status);
  if (query.reportDateFrom) params.set('reportDateFrom', query.reportDateFrom);
  if (query.reportDateTo) params.set('reportDateTo', query.reportDateTo);
  if (query.minTotalAmount !== undefined)
    params.set('minTotalAmount', String(query.minTotalAmount));
  if (query.maxTotalAmount !== undefined)
    params.set('maxTotalAmount', String(query.maxTotalAmount));
  if (query.expenseCategories) params.set('expenseCategories', query.expenseCategories);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);

  const url = `${API_URL}/api/expense-reports?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch expense reports: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<IPaginatedExpenseReports>;
}

export async function fetchExpenseReportById(id: string): Promise<IExpenseReport> {
  const response = await fetch(`${API_URL}/api/expense-reports/${id}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch expense report: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<IExpenseReport>;
}

export async function createExpenseReport(
  payload: ICreateExpenseReportPayload,
): Promise<IExpenseReport> {
  console.log('[API] Creating expense report:', payload);

  try {
    const response = await fetch(`${API_URL}/api/expense-reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purpose: payload.purpose, reportDate: payload.date }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create expense report: ${response.status} ${response.statusText}`,
      );
    }

    const result = (await response.json()) as IExpenseReport;
    console.log('[API] Expense report created successfully:', result);
    return result;
  } catch (error) {
    console.error('[API] Failed to create expense report:', error);
    throw error;
  }
}
