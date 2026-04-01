import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchExpenseReports } from '../api/expense-reports.api';
import type {
  IActiveFilterChip,
  IExpenseReport,
  IFilterState,
  TExpenseReportStatus,
} from '../types/expense-report.types';

const DEBOUNCE_MS = 300;
const MAX_AMOUNT_SENTINEL = 1000; // slider max — means "no filter"

export const DEFAULT_FILTER_STATE: IFilterState = {
  status: '',
  reportDateFrom: '',
  reportDateTo: '',
  maxTotalAmount: MAX_AMOUNT_SENTINEL,
  categories: [],
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export interface IUseExpenseReportsResult {
  reports: IExpenseReport[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  filterState: IFilterState;
  setFilterState: (state: IFilterState) => void;
  appliedFilters: IFilterState;
  applyFilters: () => void;
  clearFilters: () => void;
  activeFilterChips: IActiveFilterChip[];
  removeFilterChip: (key: string) => void;
  isFilterSheetOpen: boolean;
  openFilterSheet: () => void;
  closeFilterSheet: () => void;
  setPage: (page: number) => void;
}

export function useExpenseReports(): IUseExpenseReportsResult {
  const [reports, setReports] = useState<IExpenseReport[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // filterState = what's in the sheet (pending)
  const [filterState, setFilterState] = useState<IFilterState>(DEFAULT_FILTER_STATE);
  // appliedFilters = what's actually sent to the API
  const [appliedFilters, setAppliedFilters] = useState<IFilterState>(DEFAULT_FILTER_STATE);

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounce search input ──────────────────────────────────────────────────
  useEffect(() => {
    if (debounceTimer.current !== null) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current !== null) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [search]);

  // ── Fetch data whenever query params change ────────────────────────────────
  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchExpenseReports({
          page,
          limit: 20,
          search: debouncedSearch || undefined,
          status: (appliedFilters.status as TExpenseReportStatus) || undefined,
          reportDateFrom: appliedFilters.reportDateFrom || undefined,
          reportDateTo: appliedFilters.reportDateTo || undefined,
          maxTotalAmount:
            appliedFilters.maxTotalAmount < MAX_AMOUNT_SENTINEL
              ? appliedFilters.maxTotalAmount
              : undefined,
          expenseCategories:
            appliedFilters.categories.length > 0
              ? appliedFilters.categories.join(',')
              : undefined,
          sortBy: appliedFilters.sortBy,
          sortOrder: appliedFilters.sortOrder,
        });

        setReports(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load expense reports';
        setError(message);
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [page, debouncedSearch, appliedFilters]);

  // ── Filter sheet actions ───────────────────────────────────────────────────
  const openFilterSheet = useCallback((): void => {
    // Sync the sheet state with the currently applied filters
    setFilterState(appliedFilters);
    setIsFilterSheetOpen(true);
  }, [appliedFilters]);

  const closeFilterSheet = useCallback((): void => {
    setIsFilterSheetOpen(false);
  }, []);

  const applyFilters = useCallback((): void => {
    setAppliedFilters(filterState);
    setPage(1);
    setIsFilterSheetOpen(false);
  }, [filterState]);

  const clearFilters = useCallback((): void => {
    setFilterState(DEFAULT_FILTER_STATE);
    setAppliedFilters(DEFAULT_FILTER_STATE);
    setPage(1);
    setIsFilterSheetOpen(false);
  }, []);

  // ── Build active filter chips from appliedFilters ─────────────────────────
  const activeFilterChips: IActiveFilterChip[] = [];

  if (appliedFilters.status) {
    const label =
      appliedFilters.status.charAt(0) + appliedFilters.status.slice(1).toLowerCase();
    activeFilterChips.push({ key: 'status', label: `Status: ${label}` });
  }
  if (appliedFilters.reportDateFrom) {
    activeFilterChips.push({
      key: 'reportDateFrom',
      label: `From: ${appliedFilters.reportDateFrom}`,
    });
  }
  if (appliedFilters.reportDateTo) {
    activeFilterChips.push({
      key: 'reportDateTo',
      label: `To: ${appliedFilters.reportDateTo}`,
    });
  }
  if (appliedFilters.maxTotalAmount < MAX_AMOUNT_SENTINEL) {
    activeFilterChips.push({
      key: 'maxTotalAmount',
      label: `Max: $${appliedFilters.maxTotalAmount}`,
    });
  }
  if (appliedFilters.categories.length > 0) {
    activeFilterChips.push({
      key: 'categories',
      label: `Categories: ${appliedFilters.categories.length}`,
    });
  }
  const isCustomSort =
    appliedFilters.sortBy !== 'createdAt' ||
    appliedFilters.sortOrder !== 'desc';
  if (isCustomSort) {
    let sortLabel = 'Newest';
    if (appliedFilters.sortBy === 'totalAmount') {
      sortLabel = appliedFilters.sortOrder === 'desc' ? 'Amount: High to Low' : 'Amount: Low to High';
    } else if (appliedFilters.sortOrder === 'asc') {
      sortLabel = 'Oldest';
    }
    activeFilterChips.push({ key: 'sort', label: sortLabel });
  }

  // ── Remove individual filter chip ─────────────────────────────────────────
  const removeFilterChip = useCallback((key: string): void => {
    setAppliedFilters((prev) => {
      const next: IFilterState = { ...prev };
      switch (key) {
        case 'status':
          next.status = '';
          break;
        case 'reportDateFrom':
          next.reportDateFrom = '';
          break;
        case 'reportDateTo':
          next.reportDateTo = '';
          break;
        case 'maxTotalAmount':
          next.maxTotalAmount = MAX_AMOUNT_SENTINEL;
          break;
        case 'categories':
          next.categories = [];
          break;
        case 'sort':
          next.sortBy = 'createdAt';
          next.sortOrder = 'desc';
          break;
      }
      return next;
    });
    setPage(1);
  }, []);

  return {
    reports,
    total,
    page,
    totalPages,
    isLoading,
    error,
    search,
    setSearch,
    filterState,
    setFilterState,
    appliedFilters,
    applyFilters,
    clearFilters,
    activeFilterChips,
    removeFilterChip,
    isFilterSheetOpen,
    openFilterSheet,
    closeFilterSheet,
    setPage,
  };
}
