export interface Currency {
  id: string;
  symbol: string;
  name: string;
  code: string;
}

export interface AllocationRule {
  id: string;
  name: string;
  percent: number;
  color: string;
  icon: string;
  defaultCategory: string;
}

export interface Transaction {
  id: string;
  date: string;
  month: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  ruleId?: string | null;
}

export interface CategoryPaletteItem {
  name: string;
  color: string;
  icon: string;
}

export interface MonthBudget {
  income: Record<string, number>;
  expense: Record<string, number>;
}

export type BudgetsMap = Record<string, MonthBudget>;
