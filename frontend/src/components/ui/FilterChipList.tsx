import type { IActiveFilterChip } from '../../types/expense-report.types';
import { FilterChip } from './FilterChip';

interface IFilterChipListProps {
  chips: IActiveFilterChip[];
  onRemove: (key: string) => void;
}

export function FilterChipList({
  chips,
  onRemove,
}: IFilterChipListProps): JSX.Element | null {
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
      {chips.map((chip) => (
        <FilterChip key={chip.key} label={chip.label} onRemove={() => onRemove(chip.key)} />
      ))}
    </div>
  );
}
