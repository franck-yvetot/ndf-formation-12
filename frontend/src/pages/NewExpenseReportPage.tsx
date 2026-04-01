import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExpenseReport } from '../api/expense-reports.api';

export function NewExpenseReportPage(): JSX.Element {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = purpose.trim().length > 0 && date.length > 0;

  const handleClose = (): void => {
    navigate(-1);
  };

  const handleCancel = (): void => {
    navigate(-1);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!isValid || isSubmitting) return;

    console.log('[NewExpenseReportPage] Form submitted:', { purpose, date });
    setIsSubmitting(true);
    setError(null);

    try {
      await createExpenseReport({ purpose, date });
      console.log('[NewExpenseReportPage] Report created, navigating back');
      navigate('/');
    } catch (err) {
      console.error('[NewExpenseReportPage] Error creating report:', err);
      setError(err instanceof Error ? err.message : 'Failed to create report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center rounded-full text-text-light dark:text-text-dark hover:bg-subtle-light dark:hover:bg-subtle-dark transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h1 className="text-lg font-bold text-foreground-light dark:text-foreground-dark">
          New Report
        </h1>

        {/* Spacer to keep title centered */}
        <div className="w-10" />
      </header>

      {/* Body */}
      <main className="flex-grow">
        <div className="space-y-6 p-4">
          {/* Purpose field */}
          <div className="space-y-2">
            <label
              htmlFor="purpose"
              className="block text-sm font-medium text-foreground-light dark:text-foreground-dark"
            >
              Purpose
            </label>
            <input
              id="purpose"
              type="text"
              placeholder="e.g. Q3 Client Meeting"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-subtle-light dark:bg-subtle-dark border-none rounded-lg h-14 px-4 text-foreground-light dark:text-foreground-dark placeholder:text-text-light/50 dark:placeholder:text-text-dark/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Date field */}
          <div className="space-y-2">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-foreground-light dark:text-foreground-dark"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-subtle-light dark:bg-subtle-dark border-none rounded-lg h-14 px-4 text-foreground-light dark:text-foreground-dark [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Error message */}
          {error !== null && (
            <p className="text-red-500 text-sm" role="alert">
              {error}
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center space-x-4 p-4 pb-8">
        <button
          onClick={handleCancel}
          className="flex-1 h-14 rounded-xl font-semibold bg-subtle-light dark:bg-subtle-dark text-text-light dark:text-text-dark transition-colors hover:opacity-80 active:opacity-70"
        >
          Cancel
        </button>
        <button
          onClick={() => void handleSubmit()}
          disabled={!isValid || isSubmitting}
          className="flex-1 h-14 rounded-xl font-semibold bg-primary text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:opacity-80"
        >
          {isSubmitting ? 'Creating...' : 'Create Report'}
        </button>
      </footer>
    </div>
  );
}
