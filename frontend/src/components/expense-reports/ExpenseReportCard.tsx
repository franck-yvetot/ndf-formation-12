import { useNavigate } from 'react-router-dom';
import type { IExpenseReport, TExpenseCategory } from '../../types/expense-report.types';
import { CategoryIconList } from '../ui/CategoryIconList';
import { StatusBadge } from '../ui/StatusBadge';

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  // Handle both YYYY-MM-DD and ISO datetime strings
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface IExpenseReportCardProps {
  report: IExpenseReport;
  onClick?: () => void;
}

export function ExpenseReportCard({
  report,
  onClick,
}: IExpenseReportCardProps): JSX.Element {
  const navigate = useNavigate();

  // Extract unique categories from nested expenses (when available)
  const categories: TExpenseCategory[] = report.expenses
    ? report.expenses
        .map((e) => e.category)
        .filter((cat, index, self) => self.indexOf(cat) === index)
    : [];

  const handleClick = (): void => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/expense-reports/${report.id}`);
    }
  };

  return (
    <article
      className="bg-white dark:bg-background-dark/50 p-4 rounded-xl shadow-sm space-y-3 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
    >
      {/* Row 1: title + amount */}
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <p className="text-foreground-light dark:text-foreground-dark font-semibold truncate">
            {report.purpose}
          </p>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {formatDate(report.reportDate)}
          </p>
        </div>
        <p className="text-lg font-bold text-primary shrink-0">
          {formatCurrency(report.totalAmount)}
        </p>
      </div>

      {/* Row 2: category icons + status badge */}
      <div className="flex items-center justify-between">
        <CategoryIconList categories={categories} />
        <StatusBadge status={report.status} />
      </div>
    </article>
  );
}
