import type { IExpenseReport } from '../../types/expense-report.types';
import { ExpenseReportCard } from './ExpenseReportCard';

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard(): JSX.Element {
  return (
    <div className="bg-white dark:bg-background-dark/50 p-4 rounded-xl shadow-sm space-y-3 animate-pulse">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/3" />
        </div>
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-16 shrink-0" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div className="size-8 bg-gray-200 dark:bg-white/10 rounded-full" />
          <div className="size-8 bg-gray-200 dark:bg-white/10 rounded-full" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState(): JSX.Element {
  return (
    <div className="px-4 py-16 flex flex-col items-center text-center">
      <span className="material-symbols-outlined text-5xl text-muted-light dark:text-muted-dark mb-4">
        receipt_long
      </span>
      <p className="text-foreground-light dark:text-foreground-dark font-semibold text-base">
        No reports found
      </p>
      <p className="text-sm text-muted-light dark:text-muted-dark mt-1 max-w-xs">
        Try adjusting your search query or filters.
      </p>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }): JSX.Element {
  return (
    <div className="px-4 py-16 flex flex-col items-center text-center">
      <span className="material-symbols-outlined text-5xl text-red-400 mb-4">
        error_outline
      </span>
      <p className="text-foreground-light dark:text-foreground-dark font-semibold text-base">
        Failed to load reports
      </p>
      <p className="text-sm text-muted-light dark:text-muted-dark mt-1 max-w-xs">{message}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface IExpenseReportListProps {
  reports: IExpenseReport[];
  isLoading: boolean;
  error: string | null;
  onCardClick?: (id: string) => void;
}

export function ExpenseReportList({
  reports,
  isLoading,
  error,
  onCardClick,
}: IExpenseReportListProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="px-4 space-y-4">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error !== null) {
    return <ErrorState message={error} />;
  }

  if (reports.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="px-4 space-y-4">
      {reports.map((report) => (
        <ExpenseReportCard
          key={report.id}
          report={report}
          onClick={onCardClick ? () => onCardClick(report.id) : undefined}
        />
      ))}
    </div>
  );
}
