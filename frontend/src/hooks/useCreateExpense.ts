import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExpense } from '../api/expenses.api';
import type { TExpenseCategory } from '../types/expense-report.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface IFormState {
  category: TExpenseCategory;
  amount: string;
  name: string;
  description: string;
  expenseDate: string;
}

interface IUseCreateExpenseReturn {
  form: IFormState;
  attachments: File[];
  isSubmitting: boolean;
  error: string | null;
  updateField: <K extends keyof IFormState>(key: K, value: IFormState[K]) => void;
  handleAttachFiles: (files: FileList | null) => void;
  handleSubmit: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCreateExpense(reportId: string): IUseCreateExpenseReturn {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    console.log('[useCreateExpense] Submitting expense:', { ...form, reportId });
    setIsSubmitting(true);
    setError(null);

    try {
      await createExpense(reportId, {
        category: form.category,
        amount: parsedAmount,
        // Use name if provided, otherwise fall back to a formatted category label
        expenseName: form.name.trim() || form.category.replace(/_/g, ' '),
        description: form.description.trim() || null,
        expenseDate: form.expenseDate || undefined,
      });

      console.log('[useCreateExpense] Expense created, navigating back');
      navigate(-1);
    } catch (err) {
      console.error('[useCreateExpense] Error creating expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to create expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    attachments,
    isSubmitting,
    error,
    updateField,
    handleAttachFiles,
    handleSubmit,
  };
}
