import type { TExpenseReportStatus } from '../../types/expense-report.types';

interface IStatusConfig {
  label: string;
  className: string;
}

const STATUS_CONFIG: Record<TExpenseReportStatus, IStatusConfig> = {
  CREATED: { label: 'Created', className: 'text-amber-500' },
  SUBMITTED: { label: 'Submitted', className: 'text-blue-500' },
  VALIDATED: { label: 'Approved', className: 'text-lime-500' },
  DENIED: { label: 'Denied', className: 'text-red-500' },
  PAID: { label: 'Paid', className: 'text-green-500' },
};

interface IStatusBadgeProps {
  status: TExpenseReportStatus;
}

export function StatusBadge({ status }: IStatusBadgeProps): JSX.Element {
  const config: IStatusConfig = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'text-gray-500',
  };

  return <span className={`text-sm font-medium ${config.className}`}>{config.label}</span>;
}
