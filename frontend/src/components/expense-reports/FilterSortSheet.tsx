import type { IFilterState, TExpenseCategory, TExpenseReportStatus } from '../../types/expense-report.types';

// ─── Config ───────────────────────────────────────────────────────────────────

interface IStatusOption {
  value: TExpenseReportStatus | '';
  label: string;
  activeClass: string;
}

const STATUS_OPTIONS: IStatusOption[] = [
  {
    value: '',
    label: 'All',
    activeClass: 'border-gray-500 text-gray-700 dark:text-gray-200',
  },
  {
    value: 'SUBMITTED',
    label: 'Submitted',
    activeClass: 'border-blue-500 text-blue-600',
  },
  {
    value: 'VALIDATED',
    label: 'Approved',
    activeClass: 'border-lime-500 text-lime-600',
  },
  {
    value: 'DENIED',
    label: 'Denied',
    activeClass: 'border-red-500 text-red-600',
  },
  {
    value: 'PAID',
    label: 'Paid',
    activeClass: 'border-green-500 text-green-600',
  },
  {
    value: 'CREATED',
    label: 'Created',
    activeClass: 'border-amber-500 text-amber-600',
  },
];

interface ICategoryOption {
  value: TExpenseCategory;
  label: string;
  icon: string;
}

const CATEGORY_OPTIONS: ICategoryOption[] = [
  { value: 'RESTAURANT', label: 'Meals', icon: 'restaurant' },
  { value: 'TRAVEL', label: 'Travel', icon: 'flight' },
  { value: 'OFFICE_SUPPLIES', label: 'Supplies', icon: 'shopping_cart' },
  { value: 'TEAM_EVENT', label: 'Team Event', icon: 'groups' },
  { value: 'TRANSPORT', label: 'Transport', icon: 'directions_car' },
  { value: 'HOTEL', label: 'Hotel', icon: 'hotel' },
  { value: 'OTHER', label: 'Other', icon: 'receipt' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface IFilterSortSheetProps {
  isOpen: boolean;
  filterState: IFilterState;
  onFilterChange: (state: IFilterState) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FilterSortSheet({
  isOpen,
  filterState,
  onFilterChange,
  onApply,
  onClear,
  onClose,
}: IFilterSortSheetProps): JSX.Element | null {
  if (!isOpen) return null;

  const setField = <K extends keyof IFilterState>(key: K, value: IFilterState[K]): void => {
    onFilterChange({ ...filterState, [key]: value });
  };

  const toggleCategory = (cat: TExpenseCategory): void => {
    const next = filterState.categories.includes(cat)
      ? filterState.categories.filter((c) => c !== cat)
      : [...filterState.categories, cat];
    setField('categories', next);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 bg-background-light dark:bg-background-dark rounded-t-2xl shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Filter & Sort"
      >
        {/* Sheet header */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground-light dark:text-foreground-dark">
            Filter &amp; Sort
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close filter sheet"
          >
            <span className="material-symbols-outlined text-muted-light leading-none">
              close
            </span>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto pb-28">

          {/* ── Status ── */}
          <section>
            <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark mb-3">
              Status
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(({ value, label, activeClass }) => {
                const isSelected = filterState.status === value;
                return (
                  <button
                    key={value === '' ? 'all' : value}
                    onClick={() =>
                      setField('status', value as TExpenseReportStatus | '')
                    }
                    className={`py-2.5 px-4 rounded-lg text-sm font-medium border-2 transition-colors ${
                      isSelected
                        ? `${activeClass} bg-current/5`
                        : 'border-gray-200 dark:border-white/10 text-muted-light dark:text-muted-dark'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Date range ── */}
          <section>
            <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark mb-3">
              Date Range
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="filter-date-from"
                  className="block text-xs text-muted-light dark:text-muted-dark mb-1"
                >
                  From
                </label>
                <input
                  id="filter-date-from"
                  type="date"
                  value={filterState.reportDateFrom}
                  onChange={(e) => setField('reportDateFrom', e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark/50 text-sm text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label
                  htmlFor="filter-date-to"
                  className="block text-xs text-muted-light dark:text-muted-dark mb-1"
                >
                  To
                </label>
                <input
                  id="filter-date-to"
                  type="date"
                  value={filterState.reportDateTo}
                  onChange={(e) => setField('reportDateTo', e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark/50 text-sm text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </section>

          {/* ── Total amount slider ── */}
          <section>
            <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark mb-1">
              Max Total Amount
            </h3>
            <p className="text-xs text-muted-light dark:text-muted-dark mb-3">
              {filterState.maxTotalAmount >= 1000
                ? 'No limit'
                : `Up to $${filterState.maxTotalAmount}`}
            </p>
            <input
              type="range"
              min={0}
              max={1000}
              step={50}
              value={filterState.maxTotalAmount}
              onChange={(e) => setField('maxTotalAmount', Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Maximum total amount filter"
            />
            <div className="flex justify-between text-xs text-muted-light dark:text-muted-dark mt-1">
              <span>$0</span>
              <span>$1,000+</span>
            </div>
          </section>

          {/* ── Categories ── */}
          <section>
            <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark mb-3">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(({ value, label, icon }) => {
                const isSelected = filterState.categories.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleCategory(value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base leading-none">
                      {icon}
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Sort ── */}
          <section>
            <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark mb-3">
              Sort By
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {/* Amount: High to Low */}
              <button
                onClick={() => {
                  setField('sortBy', 'totalAmount');
                  setField('sortOrder', 'desc');
                }}
                className={`py-2.5 px-2 rounded-lg text-sm font-medium border-2 transition-colors text-center ${
                  filterState.sortBy === 'totalAmount' && filterState.sortOrder === 'desc'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-gray-200 dark:border-white/10 text-muted-light dark:text-muted-dark'
                }`}
              >
                High to Low
              </button>

              {/* Amount: Low to High */}
              <button
                onClick={() => {
                  setField('sortBy', 'totalAmount');
                  setField('sortOrder', 'asc');
                }}
                className={`py-2.5 px-2 rounded-lg text-sm font-medium border-2 transition-colors text-center ${
                  filterState.sortBy === 'totalAmount' && filterState.sortOrder === 'asc'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-gray-200 dark:border-white/10 text-muted-light dark:text-muted-dark'
                }`}
              >
                Low to High
              </button>

              {/* Newest first */}
              <button
                onClick={() => {
                  setField('sortBy', 'createdAt');
                  setField('sortOrder', 'desc');
                }}
                className={`py-2.5 px-2 rounded-lg text-sm font-medium border-2 transition-colors text-center ${
                  filterState.sortBy === 'createdAt' && filterState.sortOrder === 'desc'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-gray-200 dark:border-white/10 text-muted-light dark:text-muted-dark'
                }`}
              >
                Newest
              </button>
            </div>
          </section>
        </div>

        {/* Sticky footer: Clear + Apply */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-white/10">
          <div className="flex gap-3">
            <button
              onClick={onClear}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-muted-light dark:text-muted-dark border-2 border-gray-200 dark:border-white/10 hover:border-primary hover:text-primary transition-colors"
            >
              Clear
            </button>
            <button
              onClick={onApply}
              className="flex-[2] py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 active:bg-primary/80 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
