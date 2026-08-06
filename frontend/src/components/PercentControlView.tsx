import React, { useMemo } from 'react';
import { Icons } from './Icons';
import { AllocationRule, Transaction, Currency } from '../types/finance';

interface PercentControlViewProps {
  allocationRules: AllocationRule[];
  monthTransactions: Transaction[];
  totalActualIncome: number;
  selectedCurrency: Currency;
  onUpdateRulePercent: (id: string, percent: number) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
  onOpenAddRuleModal: () => void;
  onRegisterPending: (rule: AllocationRule, pendingAmount: number) => void;
}

export const PercentControlView: React.FC<PercentControlViewProps> = ({
  allocationRules,
  monthTransactions,
  totalActualIncome,
  selectedCurrency,
  onUpdateRulePercent,
  onDeleteRule,
  onOpenAddRuleModal,
  onRegisterPending
}) => {
  const totalAllocationsPercent = allocationRules.reduce((a, b) => a + Number(b.percent || 0), 0);

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

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white p-7 rounded-3xl shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest">
              Asignación Automática
            </span>
            <h2 className="text-xl font-extrabold mt-0.5">Control de %</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Establece porcentajes de tus ingresos para tus metas financieras y contribuciones.
            </p>
          </div>

          <button
            onClick={onOpenAddRuleModal}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 self-start cursor-pointer"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Nueva Regla</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/10">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Ingresos Mes:</span>
            <span className="text-base font-extrabold text-emerald-400">
              {selectedCurrency.symbol}
              {totalActualIncome.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Total % Asignado:</span>
            <span className="text-base font-extrabold text-cyan-300">{totalAllocationsPercent}%</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Requerido:</span>
            <span className="text-base font-extrabold text-white">
              {selectedCurrency.symbol}
              {((totalActualIncome * totalAllocationsPercent) / 100).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Disponible Libre:</span>
            <span className="text-base font-extrabold text-slate-200">{100 - totalAllocationsPercent}%</span>
          </div>
        </div>
      </div>

      {/* Rules Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {allocationsSummary.map((rule) => (
          <div
            key={rule.id}
            className="glass-card p-5 rounded-3xl space-y-4 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl p-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  {rule.icon}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{rule.name}</h3>
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                    {rule.defaultCategory}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rule.percent}
                  onChange={(e) => onUpdateRulePercent(rule.id, parseFloat(e.target.value) || 0)}
                  className="w-14 bg-slate-100/90 dark:bg-slate-800 text-center font-extrabold text-xs text-slate-900 dark:text-white rounded-xl py-1 border border-slate-200/80 dark:border-slate-700 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">%</span>
                <button
                  onClick={() => onDeleteRule(rule.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition cursor-pointer"
                  title="Eliminar regla"
                >
                  <Icons.Trash className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center bg-slate-50/80 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold block uppercase">Meta</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {selectedCurrency.symbol}
                  {rule.targetAmount.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold block uppercase">Asignado</span>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  {selectedCurrency.symbol}
                  {rule.allocatedAmount.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold block uppercase">Pendiente</span>
                <span
                  className={`text-xs font-extrabold ${
                    rule.pendingAmount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {selectedCurrency.symbol}
                  {rule.pendingAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {rule.pendingAmount > 0 && (
              <button
                onClick={() => onRegisterPending(rule, rule.pendingAmount)}
                className="w-full bg-slate-900 dark:bg-cyan-600 hover:bg-black dark:hover:bg-cyan-700 text-white py-2 rounded-2xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Icons.Plus className="w-3.5 h-3.5" />
                <span>
                  Registrar {selectedCurrency.symbol}
                  {rule.pendingAmount.toFixed(2)}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
