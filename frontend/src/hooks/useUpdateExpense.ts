import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExpenseById, updateExpense } from '../api/expenses.api';
import type { TExpenseCategory } from '../types/expense-report.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface IFormState {
  category: TExpenseCategory;
  amount: string;
  name: string;
  description: string;
  expenseDate: string;
}

interface IUseUpdateExpenseReturn {
  form: IFormState;
  attachments: File[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  updateField: <K extends keyof IFormState>(key: K, value: IFormState[K]) => void;
  handleAttachFiles: (files: FileList | null) => void;
  handleSubmit: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUpdateExpense(
  reportId: string,
  expenseId: string,
): IUseUpdateExpenseReturn {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0] ?? '';

  const [form, setForm] = useState<IFormState>({
    category: 'TRAVEL',
    amount: '',
    name: '',
    description: '',
    expenseDate: today,
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track mount state to avoid setting state after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch existing expense data on mount
  useEffect(() => {
    if (!reportId || !expenseId) return;

    const fetchExpense = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const expense = await getExpenseById(reportId, expenseId);

        if (!isMountedRef.current) return;

        const rawDate = expense.expenseDate;
        // Normalize to YYYY-MM-DD (strip time part if present)
        const normalizedDate = rawDate.split('T')[0] ?? today;

        setForm({
          category: expense.category,
          amount: String(expense.amount),
          name: expense.expenseName,
          description: expense.description ?? '',
          expenseDate: normalizedDate,
        });
      } catch (err) {
        console.error('[useUpdateExpense] Error fetching expense:', err);
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load expense');
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    void fetchExpense();
  }, [reportId, expenseId, today]);

  const updateField = <K extends keyof IFormState>(
    key: K,
    value: IFormState[K],
  ): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAttachFiles = (files: FileList | null): void => {
    if (!files) return;
    setAttachments((prev) => [...prev, ...Array.from(files)]);
  };

  const handleSubmit = async (): Promise<void> => {
    const parsedAmount = parseFloat(form.amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0 || isSubmitting) return;

    console.log('[useUpdateExpense] Submitting update:', {
      ...form,
      reportId,
      expenseId,
    });
    setIsSubmitting(true);
    setError(null);

    try {
      await updateExpense(reportId, expenseId, {
        category: form.category,
        amount: parsedAmount,
        expenseName: form.name.trim() || form.category.replace(/_/g, ' '),
        description: form.description.trim() || null,
        expenseDate: form.expenseDate || undefined,
      });

      console.log('[useUpdateExpense] Expense updated, navigating back');
      navigate(`/expense-reports/${reportId}`);
    } catch (err) {
      console.error('[useUpdateExpense] Error updating expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    attachments,
    isLoading,
    isSubmitting,
    error,
    updateField,
    handleAttachFiles,
    handleSubmit,
  };
}
