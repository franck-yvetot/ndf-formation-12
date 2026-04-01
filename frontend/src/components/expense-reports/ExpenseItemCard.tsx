import type { TExpenseCategory, TExpenseStatus } from '../../types/expense-report.types';
import { CategoryIcon } from '../ui/CategoryIcon';

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface IStatusConfig {
  label: string;
  className: string;
}

const EXPENSE_STATUS_CONFIG: Record<TExpenseStatus, IStatusConfig> = {
  CREATED: { label: 'Draft', className: 'text-amber-500' },
  SUBMITTED: { label: 'Submitted', className: 'text-blue-500' },
  ACCEPTED: { label: 'Accepted', className: 'text-lime-600' },
  DENIED: { label: 'Denied', className: 'text-red-500' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface IExpenseItemCardProps {
  expense: {
    id: string;
    expenseName: string;
    amount: number;
    category: TExpenseCategory;
    status: TExpenseStatus;
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExpenseItemCard({ expense }: IExpenseItemCardProps): JSX.Element {
  const statusConfig: IStatusConfig = EXPENSE_STATUS_CONFIG[expense.status] ?? {
    label: expense.status,
    className: 'text-gray-500',
  };

  return (
    <div className="bg-white dark:bg-background-dark/50 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Category icon */}
        <CategoryIcon category={expense.category} />

        {/* Name & amount */}
        <div className="flex-grow min-w-0">
          <p className="font-semibold text-foreground-light dark:text-foreground-dark truncate">
            {expense.expenseName}
          </p>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            {formatCurrency(expense.amount)}
          </p>
        </div>

        {/* Status */}
        <span className={`text-sm font-medium shrink-0 ${statusConfig.className}`}>
          {statusConfig.label}
        </span>
      </div>
    </div>
  );
}
