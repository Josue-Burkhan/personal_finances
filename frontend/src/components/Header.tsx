import React from 'react';
import { Icons } from './Icons';
import { Currency } from '../types/finance';

interface HeaderProps {
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  totalActualIncome: number;
  totalActualExpense: number;
  selectedCurrency: Currency;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  setCurrentMonth,
  totalActualIncome,
  totalActualExpense,
  selectedCurrency,
  sidebarOpen,
  setSidebarOpen
}) => {
  return (
    <>
      {/* MOBILE HEADER BAR */}
      <div className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Icons.Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">Finanzas</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
        >
          <Icons.Menu />
        </button>
      </div>

      {/* TOP DASHBOARD CONTROL BAR */}
      <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Month Picker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <button
              onClick={() => {
                const d = new Date(`${currentMonth}-01`);
                d.setMonth(d.getMonth() - 1);
                setCurrentMonth(d.toISOString().substring(0, 7));
              }}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition shadow-2xs cursor-pointer"
            >
              <Icons.CaretLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 px-3">
              <Icons.Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <input
                type="month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-extrabold text-xs focus:outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={() => {
                const d = new Date(`${currentMonth}-01`);
                d.setMonth(d.getMonth() + 1);
                setCurrentMonth(d.toISOString().substring(0, 7));
              }}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition shadow-2xs cursor-pointer"
            >
              <Icons.CaretRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 rounded-2xl text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/80 flex items-center gap-1.5 shadow-2xs">
            <Icons.ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{selectedCurrency.symbol}{totalActualIncome.toFixed(2)}</span>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 px-3.5 py-1.5 rounded-2xl text-xs font-extrabold border border-rose-200/80 dark:border-rose-800/80 flex items-center gap-1.5 shadow-2xs">
            <Icons.ArrowDownLeft className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{selectedCurrency.symbol}{totalActualExpense.toFixed(2)}</span>
          </div>
        </div>
      </header>
    </>
  );
};
