import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExpenseItemCard } from '../components/expense-reports/ExpenseItemCard';
import { useExpenseReportDetails } from '../hooks/useExpenseReportDetails';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExpenseReportDetailsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { report, expenses, isLoading, error, updateReportTitle } =
    useExpenseReportDetails(id ?? '');

  // ── Inline title editing state ─────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = (): void => {
    setEditValue(report?.purpose ?? '');
    setIsEditing(true);
    // Focus the input on next tick after render
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleEditCommit = async (): Promise<void> => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== report?.purpose) {
      await updateReportTitle(trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      void handleEditCommit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 bg-background-light dark:bg-background-dark/80 backdrop-blur-sm z-10 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center p-4">
          <button
            onClick={() => navigate('/')}
            aria-label="Go back"
            className="p-2 -ml-2 text-foreground-light dark:text-foreground-dark hover:bg-primary/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>

          <h1 className="text-lg font-bold text-center flex-grow text-foreground-light dark:text-foreground-dark">
            Expense Report Details
          </h1>

          {/* Spacer to keep title centred */}
          <div className="w-10" />
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-grow p-4 pb-40">
        {/* Loading spinner */}
        {isLoading && (
          <div className="flex items-center justify-center h-48" aria-busy="true">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin">
              progress_activity
            </span>
          </div>
        )}

        {/* Error message */}
        {error !== null && !isLoading && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400 text-sm"
          >
            <span className="font-medium">Error: </span>
            {error}
          </div>
        )}

        {/* Report content */}
        {report !== null && !isLoading && (
          <>
            {/* ── Editable title ─────────────────────────────────────────── */}
            <div className="mb-6">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => void handleEditCommit()}
                    onKeyDown={handleKeyDown}
                    className="text-2xl font-bold text-foreground-light dark:text-foreground-dark bg-transparent border-b-2 border-primary outline-none flex-grow"
                    aria-label="Edit report title"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                    {report.purpose}
                  </h2>
                )}

                {!isEditing && (
                  <button
                    onClick={handleEditClick}
                    aria-label="Edit title"
                    className="p-1 text-muted-light dark:text-muted-dark hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                )}
              </div>

              <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
                Created on {formatDate(report.createdAt)}
              </p>
            </div>

            {/* ── Expenses list ──────────────────────────────────────────── */}
            {expenses.length === 0 ? (
              <p className="text-center text-muted-light dark:text-muted-dark py-12">
                No expenses yet. Tap <strong>Add Expense</strong> to get started.
              </p>
            ) : (
              <ul className="space-y-3" aria-label="Expenses">
                {expenses.map((expense) => (
                  <li key={expense.id}>
                    <ExpenseItemCard
                      expense={expense}
                      onClick={() =>
                        navigate(
                          `/expense-reports/${id ?? ''}/expenses/${expense.id}/edit`,
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      {/* ── Fixed footer ───────────────────────────────────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm border-t border-gray-200 dark:border-white/10 space-y-2">
        <button
          className="w-full h-12 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all"
          onClick={() => {
            /* TODO: submit report action */
          }}
        >
          <span className="material-symbols-outlined text-base">send</span>
          Submit Report
        </button>

        <button
          className="w-full h-12 bg-white dark:bg-background-dark/50 border border-gray-200 dark:border-white/10 rounded-lg text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-[0.98] transition-all"
          onClick={() => navigate(`/expense-reports/${id ?? ''}/expenses/new`)}
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          Add Expense
        </button>
      </footer>
    </div>
  );
}
