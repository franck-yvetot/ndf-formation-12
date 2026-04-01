import { AppLayout } from '../components/layout/AppLayout';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterChipList } from '../components/ui/FilterChipList';
import { ExpenseReportList } from '../components/expense-reports/ExpenseReportList';
import { FilterSortSheet } from '../components/expense-reports/FilterSortSheet';
import { useExpenseReports } from '../hooks/useExpenseReports';

export function ExpenseReportsPage(): JSX.Element {
  const {
    reports,
    isLoading,
    error,
    search,
    setSearch,
    filterState,
    setFilterState,
    applyFilters,
    clearFilters,
    activeFilterChips,
    removeFilterChip,
    isFilterSheetOpen,
    openFilterSheet,
    closeFilterSheet,
  } = useExpenseReports();

  return (
    <AppLayout
      headerTitle="Expense Reports"
      onHeaderAction={() => {
        // Future: navigate to create report screen
      }}
      headerActionAriaLabel="Create new expense report"
    >
      {/* Search + Filter controls */}
      <div className="p-4 space-y-3">
        {/* Search input */}
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search reports..."
        />

        {/* Filter & Sort button */}
        <div className="flex items-center">
          <button
            onClick={openFilterSheet}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary whitespace-nowrap hover:bg-primary/20 active:bg-primary/30 transition-colors"
            aria-label="Open filter and sort options"
          >
            <span className="material-symbols-outlined text-base leading-none">tune</span>
            Filter &amp; Sort
          </button>
        </div>

        {/* Active filter chips */}
        <FilterChipList chips={activeFilterChips} onRemove={removeFilterChip} />
      </div>

      {/* Report list */}
      <ExpenseReportList
        reports={reports}
        isLoading={isLoading}
        error={error}
      />

      {/* Filter & Sort bottom sheet */}
      <FilterSortSheet
        isOpen={isFilterSheetOpen}
        filterState={filterState}
        onFilterChange={setFilterState}
        onApply={applyFilters}
        onClear={clearFilters}
        onClose={closeFilterSheet}
      />
    </AppLayout>
  );
}
