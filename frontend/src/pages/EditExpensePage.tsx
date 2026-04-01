import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateExpense } from '../hooks/useUpdateExpense';
import type { TExpenseCategory } from '../types/expense-report.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { value: TExpenseCategory; label: string }[] = [
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
  { value: 'TEAM_EVENT', label: 'Team Event' },
  { value: 'OTHER', label: 'Other' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateDisplay(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditExpensePage(): JSX.Element {
  const { reportId, expenseId } = useParams<{
    reportId: string;
    expenseId: string;
  }>();
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0] ?? '';

  const {
    form,
    attachments,
    isLoading,
    isSubmitting,
    error,
    updateField,
    handleAttachFiles,
    handleSubmit,
  } = useUpdateExpense(reportId ?? '', expenseId ?? '');

  const handleClose = (): void => {
    navigate(-1);
  };

  const handleCancel = (): void => {
    navigate(-1);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    handleAttachFiles(e.dataTransfer.files);
  };

  const handleExpenseDateClick = (): void => {
    dateInputRef.current?.showPicker?.();
  };

  const handleExpenseDateKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
  ): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      dateInputRef.current?.showPicker?.();
    }
  };

  const isAmountValid =
    form.amount.trim().length > 0 && parseFloat(form.amount) > 0;

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen justify-between bg-background-light dark:bg-background-dark font-display">
        <div className="flex-1 overflow-y-auto">
          <header className="p-4 flex items-center">
            <button
              onClick={handleClose}
              aria-label="Close"
              className="p-2 text-foreground-light dark:text-foreground-dark hover:bg-primary/10 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h1 className="flex-1 text-center font-bold text-lg text-foreground-light dark:text-foreground-dark pr-8">
              Edit Expense
            </h1>
          </header>
          <main className="px-4 space-y-6 pb-6">
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-14 bg-subtle-light dark:bg-subtle-dark rounded-lg" />
                <div className="h-14 bg-subtle-light dark:bg-subtle-dark rounded-lg" />
              </div>
              <div className="h-14 bg-subtle-light dark:bg-subtle-dark rounded-lg" />
              <div className="h-24 bg-subtle-light dark:bg-subtle-dark rounded-lg" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen justify-between bg-background-light dark:bg-background-dark font-display">
      {/* ── Scrollable region ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="p-4 flex items-center">
          <button
            onClick={handleClose}
            aria-label="Close"
            className="p-2 text-foreground-light dark:text-foreground-dark hover:bg-primary/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h1 className="flex-1 text-center font-bold text-lg text-foreground-light dark:text-foreground-dark pr-8">
            Edit Expense
          </h1>
        </header>

        {/* ── Main form ───────────────────────────────────────────────────── */}
        <main className="px-4 space-y-6 pb-6">
          {/* ── Category + Amount ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-foreground-light/80 dark:text-foreground-dark/80 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={(e) =>
                  updateField('category', e.target.value as TExpenseCategory)
                }
                className="form-select w-full bg-subtle-light dark:bg-subtle-dark border-none rounded-lg h-14 px-4 text-foreground-light dark:text-foreground-dark focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {CATEGORY_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-foreground-light/80 dark:text-foreground-dark/80 mb-1"
              >
                Amount
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="text-foreground-light/50 dark:text-foreground-dark/50">
                    $
                  </span>
                </div>
                <input
                  id="amount"
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => updateField('amount', e.target.value)}
                  className="w-full bg-subtle-light dark:bg-subtle-dark border-none rounded-lg h-14 pl-8 pr-4 text-foreground-light dark:text-foreground-dark placeholder:text-foreground-light/50 dark:placeholder:text-foreground-dark/50 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── Expense Name ─────────────────────────────────────────────── */}
          <div>
            <label
              htmlFor="expense-name"
              className="block text-sm font-medium text-foreground-light/80 dark:text-foreground-dark/80 mb-1"
            >
              Expense Name{' '}
              <span className="text-foreground-light/50 dark:text-foreground-dark/50">
                (Optional)
              </span>
            </label>
            <input
              id="expense-name"
              name="expense-name"
              type="text"
              placeholder="e.g. Client Dinner"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full bg-subtle-light dark:bg-subtle-dark border-none rounded-lg h-14 px-4 text-foreground-light dark:text-foreground-dark placeholder:text-foreground-light/50 dark:placeholder:text-foreground-dark/50 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* ── Description ──────────────────────────────────────────────── */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground-light/80 dark:text-foreground-dark/80 mb-1"
            >
              Description{' '}
              <span className="text-foreground-light/50 dark:text-foreground-dark/50">
                (Optional)
              </span>
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="A short description of the expense"
              rows={3}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full bg-subtle-light dark:bg-subtle-dark border-none rounded-lg p-4 text-foreground-light dark:text-foreground-dark placeholder:text-foreground-light/50 dark:placeholder:text-foreground-dark/50 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          {/* ── File upload drop zone ─────────────────────────────────────── */}
          <div
            className="relative flex flex-col items-center justify-center border-2 border-dashed border-subtle-dark/30 dark:border-subtle-light/30 rounded-xl p-6 text-center bg-subtle-light/50 dark:bg-subtle-dark/50"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="bg-primary/20 dark:bg-primary/30 p-3 rounded-full mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">
                cloud_upload
              </span>
            </div>
            <p className="font-semibold text-foreground-light dark:text-foreground-dark">
              Drag &amp; drop files here
            </p>
            <p className="text-sm text-foreground-light/60 dark:text-foreground-dark/60">
              {attachments.length > 0
                ? `${attachments.length} file${attachments.length > 1 ? 's' : ''} selected`
                : 'or click to upload'}
            </p>
            <input
              type="file"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleAttachFiles(e.target.files)}
              aria-label="Upload files"
            />
          </div>

          {/* ── Dates section ─────────────────────────────────────────────── */}
          <div className="space-y-2 pt-2">
            {/* Report Date — non-editable */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-subtle-light dark:bg-subtle-dark">
              <span className="text-foreground-light dark:text-foreground-dark">
                Report Date
              </span>
              <span className="text-foreground-light dark:text-foreground-dark font-medium">
                {formatDateDisplay(today)}
              </span>
            </div>

            {/* Expense Date — clickable, opens native date picker */}
            <div
              className="flex items-center justify-between p-4 rounded-lg bg-subtle-light dark:bg-subtle-dark cursor-pointer hover:bg-subtle-light/80 dark:hover:bg-subtle-dark/80 transition-colors"
              onClick={handleExpenseDateClick}
              onKeyDown={handleExpenseDateKeyDown}
              role="button"
              tabIndex={0}
              aria-label={`Expense date: ${formatDateDisplay(form.expenseDate)}, tap to change`}
            >
              <span className="text-foreground-light dark:text-foreground-dark">
                Expense Date
              </span>
              <div className="flex items-center gap-2">
                <span className="text-primary font-medium">
                  {formatDateDisplay(form.expenseDate)}
                </span>
                <span className="material-symbols-outlined text-foreground-light/60 dark:text-foreground-dark/60">
                  arrow_forward_ios
                </span>
              </div>
            </div>

            {/* Hidden date input — triggered programmatically */}
            <input
              ref={dateInputRef}
              type="date"
              value={form.expenseDate}
              onChange={(e) => updateField('expenseDate', e.target.value)}
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>

          {/* ── Error message ─────────────────────────────────────────────── */}
          {error !== null && (
            <p className="text-red-500 text-sm" role="alert">
              {error}
            </p>
          )}
        </main>
      </div>

      {/* ── Sticky footer ─────────────────────────────────────────────────── */}
      <footer className="p-4 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-white/10">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCancel}
            className="w-full bg-subtle-light dark:bg-subtle-dark text-foreground-light dark:text-foreground-dark font-bold h-14 rounded-xl flex items-center justify-center hover:opacity-80 active:opacity-70 transition-opacity"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !isAmountValid}
            className="w-full bg-primary text-white font-bold h-14 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:opacity-80 transition-opacity"
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </footer>
    </div>
  );
}
