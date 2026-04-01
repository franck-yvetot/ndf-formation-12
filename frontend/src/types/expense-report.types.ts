// ─── Status & Category enums (mirror backend enums) ─────────────────────────

export type TExpenseReportStatus =
  | 'CREATED'
  | 'SUBMITTED'
  | 'VALIDATED'
  | 'DENIED'
  | 'PAID';

export type TExpenseCategory =
  | 'TRAVEL'
  | 'HOTEL'
  | 'RESTAURANT'
  | 'TRANSPORT'
  | 'OFFICE_SUPPLIES'
  | 'TEAM_EVENT'
  | 'OTHER';

export type TSortByField =
  | 'purpose'
  | 'reportDate'
  | 'totalAmount'
  | 'status'
  | 'createdAt'
  | 'updatedAt';

export type TSortOrder = 'asc' | 'desc';

// ─── Domain interfaces ────────────────────────────────────────────────────────

export interface IExpense {
  id: string;
  category: TExpenseCategory;
  amount: number;
  description: string;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IExpenseReport {
  id: string;
  /** Reason / title for the expense report */
  purpose: string;
  /** YYYY-MM-DD */
  reportDate: string;
  status: TExpenseReportStatus;
  totalAmount: number;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Not returned by the list endpoint — present only when fetching a single report */
  expenses?: IExpense[];
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface IPaginatedExpenseReports {
  data: IExpenseReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Query / filter params ────────────────────────────────────────────────────

export interface IExpenseReportQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TExpenseReportStatus;
  reportDateFrom?: string;
  reportDateTo?: string;
  minTotalAmount?: number;
  maxTotalAmount?: number;
  /** Comma-separated list of ExpenseCategory values, e.g. "HOTEL,RESTAURANT" */
  expenseCategories?: string;
  sortBy?: TSortByField;
  sortOrder?: TSortOrder;
}

// ─── Filter UI state ──────────────────────────────────────────────────────────

export interface IFilterState {
  status: TExpenseReportStatus | '';
  reportDateFrom: string;
  reportDateTo: string;
  /** Upper bound for total amount slider; 1000 = no filter */
  maxTotalAmount: number;
  categories: TExpenseCategory[];
  sortBy: TSortByField;
  sortOrder: TSortOrder;
}

// ─── Active filter chip ───────────────────────────────────────────────────────

export interface IActiveFilterChip {
  key: string;
  label: string;
}
