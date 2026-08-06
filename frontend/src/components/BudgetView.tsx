import React from 'react';
import { Icons } from './Icons';
import { Currency, BudgetsMap, Transaction } from '../types/finance';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES, CATEGORY_PALETTE } from '../constants/finance';

interface BudgetViewProps {
  currentMonth: string;
  budgets: BudgetsMap;
  monthTransactions: Transaction[];
  selectedCurrency: Currency;
  totalPlannedIncome: number;
  totalActualIncome: number;
  totalPlannedExpense: number;
  totalActualExpense: number;
  onUpdateBudget: (type: 'income' | 'expense', category: string, amount: string) => Promise<void>;
  onCopyPreviousMonthBudget: () => Promise<void>;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  currentMonth,
  budgets,
  monthTransactions,
  selectedCurrency,
  totalPlannedIncome,
  totalActualIncome,
  totalPlannedExpense,
  totalActualExpense,
  onUpdateBudget,
  onCopyPreviousMonthBudget
}) => {
  const currentBudget = budgets[currentMonth] || { income: {}, expense: {} };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Plantilla de Presupuesto Mensual</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Planifica tu expectativa estimada para {currentMonth} y compara desviaciones.
          </p>
        </div>
        <button
          onClick={onCopyPreviousMonthBudget}
          className="flex items-center gap-2 bg-cyan-50 dark:bg-slate-800 hover:bg-cyan-100 dark:hover:bg-slate-700 text-cyan-800 dark:text-cyan-300 px-4 py-2 rounded-2xl text-xs font-extrabold transition border border-cyan-200/80 dark:border-slate-700 shadow-2xs self-start cursor-pointer"
        >
          <Icons.Copy className="w-4 h-4" />
          Copiar del Mes Anterior
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INCOME BUDGET */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              🟢 Ingresos (Plan vs Real)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold">
              {selectedCurrency.symbol}
              {totalPlannedIncome.toFixed(2)} / {selectedCurrency.symbol}
              {totalActualIncome.toFixed(2)}
            </span>
          </div>

          <div className="space-y-3">
            {DEFAULT_INCOME_CATEGORIES.map((category) => {
              const plannedVal = currentBudget.income?.[category];
              const plannedNum = typeof plannedVal === 'number' ? plannedVal : parseFloat(String(plannedVal || 0)) || 0;
              const actual = monthTransactions
                .filter((t) => t.type === 'income' && t.category === category)
                .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
              const diff = actual - plannedNum;
              const categoryObj = CATEGORY_PALETTE.find((c) => c.name === category);

              return (
                <div
                  key={category}
                  className="p-3 bg-slate-50/60 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white dark:hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{categoryObj?.icon || '💼'}</span>
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block">{category}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Real:{' '}
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {selectedCurrency.symbol}
                          {actual.toFixed(2)}
                        </strong>{' '}
                        | Diff:{' '}
                        <span
                          className={
                            diff >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-amber-600 dark:text-amber-400 font-extrabold'
                          }
                        >
                          {diff >= 0 ? '+' : ''}
                          {selectedCurrency.symbol}
                          {diff.toFixed(2)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400">Plan:</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={plannedVal ?? ''}
                      onChange={(e) => onUpdateBudget('income', category, e.target.value)}
                      className="w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-right font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* EXPENSE BUDGET */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-rose-700 dark:text-rose-400 flex items-center gap-2">
              🔴 Gastos (Plan vs Real)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold">
              {selectedCurrency.symbol}
              {totalPlannedExpense.toFixed(2)} / {selectedCurrency.symbol}
              {totalActualExpense.toFixed(2)}
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {DEFAULT_EXPENSE_CATEGORIES.map((category) => {
              const plannedVal = currentBudget.expense?.[category];
              const plannedNum = typeof plannedVal === 'number' ? plannedVal : parseFloat(String(plannedVal || 0)) || 0;
              const actual = monthTransactions
                .filter((t) => t.type === 'expense' && t.category === category)
                .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
              const diff = actual - plannedNum;
              const categoryObj = CATEGORY_PALETTE.find((c) => c.name === category);

              return (
                <div
                  key={category}
                  className="p-3 bg-slate-50/60 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white dark:hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{categoryObj?.icon || '📦'}</span>
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block">{category}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Real:{' '}
                        <strong className="text-rose-600 dark:text-rose-400">
                          {selectedCurrency.symbol}
                          {actual.toFixed(2)}
                        </strong>{' '}
                        | Diff:{' '}
                        <span
                          className={
                            diff <= 0 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-rose-600 dark:text-rose-400 font-extrabold'
                          }
                        >
                          {diff > 0 ? '+' : ''}
                          {selectedCurrency.symbol}
                          {diff.toFixed(2)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400">Plan:</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={plannedVal ?? ''}
                      onChange={(e) => onUpdateBudget('expense', category, e.target.value)}
                      className="w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-right font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
