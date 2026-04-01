import type {
  IExpense,
  IExpenseReport,
  IUpdateExpenseReportPayload,
} from '../types/expense-report.types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// ─── Expense Report ───────────────────────────────────────────────────────────

export async function getExpenseReportById(id: string): Promise<IExpenseReport> {
  const response = await fetch(`${API_URL}/api/expense-reports/${id}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch expense report: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<IExpenseReport>;
}

export async function updateExpenseReport(
  id: string,
  payload: IUpdateExpenseReportPayload,
): Promise<IExpenseReport> {
  const response = await fetch(`${API_URL}/api/expense-reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update expense report: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<IExpenseReport>;
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

interface IPaginatedExpenses {
  data: IExpense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getExpensesByReportId(reportId: string): Promise<IExpense[]> {
  const response = await fetch(
    `${API_URL}/api/expense-reports/${reportId}/expenses`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch expenses: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as IPaginatedExpenses | IExpense[];

  // Handle both paginated and plain-array responses
  if (Array.isArray(data)) {
    return data;
  }
  return data.data;
}
