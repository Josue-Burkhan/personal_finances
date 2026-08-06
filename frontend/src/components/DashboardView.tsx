import React, { useMemo } from 'react';
import { Icons } from './Icons';
import { Transaction, AllocationRule, Currency } from '../types/finance';
import { CATEGORY_PALETTE, DEFAULT_INCOME_CATEGORIES } from '../constants/finance';

interface DashboardViewProps {
  monthTransactions: Transaction[];
  totalActualIncome: number;
  totalActualExpense: number;
  totalPlannedIncome: number;
  totalPlannedExpense: number;
  netSavings: number;
  totalAllocationsPercent: number;
  allocationRules: AllocationRule[];
  selectedCurrency: Currency;
  setActiveTab: (tab: string) => void;
  onQuickAddTransaction: (rule: AllocationRule & { pendingAmount: number }) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  monthTransactions,
  totalActualIncome,
  totalActualExpense,
  totalPlannedIncome,
  totalPlannedExpense,
  netSavings,
  totalAllocationsPercent,
  allocationRules,
  selectedCurrency,
  setActiveTab,
  onQuickAddTransaction
}) => {
  // Expense breakdown for Donut Chart
  const expenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Number(t.amount);
      });

    return Object.entries(map)
      .map(([name, value]) => {
        const paletteObj = CATEGORY_PALETTE.find((c) => c.name === name);
        return {
          name,
          value,
          color: paletteObj ? paletteObj.color : '#0891b2',
          icon: paletteObj ? paletteObj.icon : '📌'
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [monthTransactions]);

  // Allocation Rules summary
  const allocationsSummary = useMemo(() => {
    return allocationRules.map((rule) => {
      const targetAmount = (totalActualIncome * rule.percent) / 100;
      const allocatedAmount = monthTransactions
        .filter((t) => t.ruleId === rule.id || (rule.id === 'rule-tithe' && t.category === 'Diezmo / Donaciones'))
        .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
      const pendingAmount = Math.max(0, targetAmount - allocatedAmount);

      return {
        ...rule,
        targetAmount,
        allocatedAmount,
        pendingAmount
      };
    });
  }, [allocationRules, totalActualIncome, monthTransactions]);

  const renderAppleDonutChart = () => {
    if (totalActualExpense === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-52 text-slate-400 dark:text-slate-500 text-xs font-semibold">
          <Icons.PieChart className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
          <span>Sin gastos registrados en este período</span>
        </div>
      );
    }

    let cumulativeAngle = 0;
    const slices = expenseBreakdown.map((item) => {
      const percentage = item.value / totalActualExpense;
      const angle = percentage * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;

      const x1 = 50 + 40 * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = 50 + 40 * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = 50 + 40 * Math.cos((Math.PI * (cumulativeAngle - 90)) / 180);
      const y2 = 50 + 40 * Math.sin((Math.PI * (cumulativeAngle - 90)) / 180);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const pathData =
        angle === 360
          ? `M 50,10 A 40,40 0 1,1 49.99,10 Z`
          : `M ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`;

      return {
        ...item,
        percentage: (percentage * 100).toFixed(1),
        pathData
      };
    });

    return (
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {slices.map((slice, i) => (
              <path
                key={i}
                d={slice.pathData}
                fill="none"
                stroke={slice.color}
                strokeWidth="14"
                className="transition-all duration-300 hover:opacity-80 cursor-pointer stroke-linecap-round"
              />
            ))}
          </svg>
          <div className="absolute flex flex-col items-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Gastos Totales
            </span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              {selectedCurrency.symbol}
              {totalActualExpense.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1">
          {slices.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 transition shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {item.icon} {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <span>
                  {selectedCurrency.symbol}
                  {item.value.toFixed(2)}
                </span>
                <span className="text-[10px] text-cyan-800 dark:text-cyan-300 bg-cyan-100/80 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full font-bold">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card (Emerald Positive) */}
        <div className="glass-card p-5 rounded-3xl transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-2">
            <span>INGRESOS REALES</span>
            <span className="p-2 bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-2xl">
              <Icons.ArrowUpRight />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-950 dark:text-emerald-300 tracking-tight">
            {selectedCurrency.symbol}
            {totalActualIncome.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800">
            <span>Plan: {selectedCurrency.symbol}{totalPlannedIncome.toFixed(2)}</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalActualIncome >= totalPlannedIncome ? 'Meta superada' : 'En progreso'}
            </span>
          </div>
        </div>

        {/* Expense Card (Crimson Rose Negative) */}
        <div className="glass-card p-5 rounded-3xl transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-400 mb-2">
            <span>GASTOS TOTALES</span>
            <span className="p-2 bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-2xl">
              <Icons.ArrowDownLeft />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-rose-950 dark:text-rose-300 tracking-tight">
            {selectedCurrency.symbol}
            {totalActualExpense.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800">
            <span>Presupuesto: {selectedCurrency.symbol}{totalPlannedExpense.toFixed(2)}</span>
            <span
              className={`font-extrabold ${
                totalActualExpense <= totalPlannedExpense ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {totalActualExpense <= totalPlannedExpense ? 'Bajo control' : '⚠️ Excedido'}
            </span>
          </div>
        </div>

        {/* Balance Card (Sky/Ice Cyan Accent) */}
        <div className="glass-card p-5 rounded-3xl transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-800 dark:text-cyan-400 mb-2">
            <span>AHORRO / DISPONIBLE</span>
            <span className="p-2 bg-cyan-100/80 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 rounded-2xl">
              <Icons.Wallet />
            </span>
          </div>
          <div
            className={`text-2xl font-extrabold tracking-tight ${
              netSavings >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {selectedCurrency.symbol}
            {netSavings.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800">
            <span>Margen Libre</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {totalActualIncome ? ((netSavings / totalActualIncome) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        {/* Percentage Rules KPI */}
        <div className="glass-card p-5 rounded-3xl transition-all hover:shadow-md bg-gradient-to-br from-purple-50/60 via-white to-cyan-50/40 dark:from-purple-950/30 dark:via-slate-900 dark:to-cyan-950/30 border-purple-200/60 dark:border-purple-900/60">
          <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-300 mb-2">
            <span>REGLAS DE % ACTIVAS</span>
            <span className="p-2 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-2xl">
              <Icons.Percent />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-purple-950 dark:text-purple-200 tracking-tight">
            {totalAllocationsPercent}% del Ingreso
          </div>
          <div className="mt-2 text-[11px] text-purple-900/80 dark:text-purple-300/80 flex items-center justify-between pt-2 border-t border-purple-100 dark:border-purple-900/40">
            <span>{allocationRules.length} Reglas</span>
            <span className="font-extrabold text-purple-700 dark:text-purple-400">
              {selectedCurrency.symbol}
              {((totalActualIncome * totalAllocationsPercent) / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* DIVIDER 1 */}
      <hr className="my-8 border-slate-200/80 dark:border-slate-800" />

      {/* SECTION 2: CHARTS & SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Donut & Expectation Bars */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-3xl shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Icons.PieChart className="text-cyan-600 dark:text-cyan-400" />
                  Distribución de Gastos por Categoría
                </h2>
              </div>
              <span className="text-xs font-bold bg-cyan-100/80 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 px-3 py-1 rounded-full">
                {expenseBreakdown.length} categorías
              </span>
            </div>

            {renderAppleDonutChart()}
          </div>

          {/* Expectation vs Reality Comparison Bars */}
          <div className="glass-card p-6 rounded-3xl shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.ChartBar className="text-cyan-600 dark:text-cyan-400" />
                Expectativa vs. Realidad
              </h2>
            </div>

            {/* Income Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Ingresos Totales</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Real:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {selectedCurrency.symbol}
                    {totalActualIncome.toFixed(2)}
                  </strong>{' '}
                  / Plan: {selectedCurrency.symbol}
                  {totalPlannedIncome.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      totalPlannedIncome ? (totalActualIncome / totalPlannedIncome) * 100 : 0
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* Expense Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Gastos Consumidos</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Real:{' '}
                  <strong
                    className={
                      totalActualExpense > totalPlannedExpense ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                    }
                  >
                    {selectedCurrency.symbol}
                    {totalActualExpense.toFixed(2)}
                  </strong>{' '}
                  / Plan: {selectedCurrency.symbol}
                  {totalPlannedExpense.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    totalActualExpense > totalPlannedExpense
                      ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                      : 'bg-gradient-to-r from-cyan-500 to-teal-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      totalPlannedExpense ? (totalActualExpense / totalPlannedExpense) * 100 : 0
                    )}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Percentage Rules Quick Overview & Recent Activity */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.Percent className="text-purple-600 dark:text-purple-400" />
                Reglas de Destino (%)
              </h3>
              <button
                onClick={() => setActiveTab('percent_control')}
                className="text-xs text-cyan-600 dark:text-cyan-400 font-extrabold hover:underline cursor-pointer"
              >
                Gestionar &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {allocationsSummary.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 rounded-2xl bg-cyan-50/50 dark:bg-slate-800/60 border border-cyan-100 dark:border-slate-700 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>{rule.icon}</span> {rule.name} ({rule.percent}%)
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {selectedCurrency.symbol}
                      {rule.allocatedAmount.toFixed(2)} / {selectedCurrency.symbol}
                      {rule.targetAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          rule.targetAmount ? (rule.allocatedAmount / rule.targetAmount) * 100 : 0
                        )}%`,
                        backgroundColor: rule.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Últimos Movimientos</h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            {monthTransactions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                Sin movimientos en este período.
              </div>
            ) : (
              <div className="space-y-2.5">
                {monthTransactions.slice(0, 5).map((item) => {
                  const categoryObj = CATEGORY_PALETTE.find((c) => c.name === item.category);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base p-2 bg-cyan-50 dark:bg-slate-700/60 rounded-xl">
                          {categoryObj ? categoryObj.icon : '💸'}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                            {item.description}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                            {item.date} • {item.category}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-black ${
                          item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.type === 'income' ? '+' : '-'}
                        {selectedCurrency.symbol}
                        {Number(item.amount).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DIVIDER 2 */}
      <hr className="my-8 border-slate-200/80 dark:border-slate-800" />

      {/* SECTION 3: CATEGORY MANAGEMENT */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Icons.Receipt className="text-cyan-600 dark:text-cyan-400" />
              Gestión & Control de Categorías
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Monitoreo del catálogo de ingresos y gastos configurados
            </p>
          </div>
          <span className="text-xs font-bold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 px-3 py-1 rounded-full">
            {CATEGORY_PALETTE.length} Categorías
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
          {CATEGORY_PALETTE.map((cat) => {
            const spentOrReceived = monthTransactions
              .filter((t) => t.category === cat.name)
              .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
            const isIncome = DEFAULT_INCOME_CATEGORIES.includes(cat.name);

            return (
              <div
                key={cat.name}
                className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1 hover:border-cyan-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{cat.icon}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isIncome
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {isIncome ? 'Ingreso' : 'Gasto'}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate" title={cat.name}>
                  {cat.name}
                </div>
                <div className="text-[11px] font-black text-cyan-800 dark:text-cyan-300 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  Total: {selectedCurrency.symbol}{spentOrReceived.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
