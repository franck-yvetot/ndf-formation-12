import { useCallback, useEffect, useState } from 'react';
import {
  getExpenseReportById,
  getExpensesByReportId,
  updateExpenseReport,
} from '../api/expenses.api';
import type { IExpense, IExpenseReport } from '../types/expense-report.types';

// ─── Result interface ─────────────────────────────────────────────────────────

export interface IUseExpenseReportDetailsResult {
  report: IExpenseReport | null;
  expenses: IExpense[];
  isLoading: boolean;
  error: string | null;
  updateReportTitle: (newTitle: string) => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExpenseReportDetails(
  reportId: string,
): IUseExpenseReportDetailsResult {
  const [report, setReport] = useState<IExpenseReport | null>(null);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;

    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const [reportData, expensesData] = await Promise.all([
          getExpenseReportById(reportId),
          getExpensesByReportId(reportId),
        ]);
        setReport(reportData);
        setExpenses(expensesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load expense report');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [reportId]);

  const updateReportTitle = useCallback(
    async (newTitle: string): Promise<void> => {
      try {
        const updated = await updateExpenseReport(reportId, { purpose: newTitle });
        setReport(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update report title');
      }
    },
    [reportId],
  );

  return { report, expenses, isLoading, error, updateReportTitle };
}
