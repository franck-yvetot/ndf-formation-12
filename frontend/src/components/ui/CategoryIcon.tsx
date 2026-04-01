import type { TExpenseCategory } from '../../types/expense-report.types';

const CATEGORY_ICONS: Record<TExpenseCategory, string> = {
  TRAVEL: 'flight',
  HOTEL: 'hotel',
  RESTAURANT: 'restaurant',
  TRANSPORT: 'directions_car',
  OFFICE_SUPPLIES: 'shopping_cart',
  TEAM_EVENT: 'groups',
  OTHER: 'receipt',
};

const CATEGORY_LABELS: Record<TExpenseCategory, string> = {
  TRAVEL: 'Travel',
  HOTEL: 'Hotel',
  RESTAURANT: 'Meals',
  TRANSPORT: 'Transport',
  OFFICE_SUPPLIES: 'Supplies',
  TEAM_EVENT: 'Team Event',
  OTHER: 'Other',
};

interface ICategoryIconProps {
  category: TExpenseCategory;
}

export function CategoryIcon({ category }: ICategoryIconProps): JSX.Element {
  const icon = CATEGORY_ICONS[category] ?? 'receipt';
  const label = CATEGORY_LABELS[category] ?? category;

  return (
    <div
      className="flex items-center justify-center size-8 rounded-full bg-primary/10"
      title={label}
      aria-label={label}
    >
      <span className="material-symbols-outlined text-primary text-lg leading-none">
        {icon}
      </span>
    </div>
  );
}
