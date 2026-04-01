import type { TExpenseCategory } from '../../types/expense-report.types';
import { CategoryIcon } from './CategoryIcon';

interface ICategoryIconListProps {
  categories: TExpenseCategory[];
}

export function CategoryIconList({ categories }: ICategoryIconListProps): JSX.Element {
  // Deduplicate categories while preserving order
  const uniqueCategories = categories.filter(
    (cat, index, self) => self.indexOf(cat) === index,
  );

  if (uniqueCategories.length === 0) {
    return <div className="flex items-center gap-2" />;
  }

  return (
    <div className="flex items-center gap-2">
      {uniqueCategories.map((cat) => (
        <CategoryIcon key={cat} category={cat} />
      ))}
    </div>
  );
}
