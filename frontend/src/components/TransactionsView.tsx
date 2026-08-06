import React, { useState, useMemo } from 'react';
import { Icons } from './Icons';
import { Transaction, Currency } from '../types/finance';
import { CATEGORY_PALETTE } from '../constants/finance';

interface TransactionsViewProps {
  monthTransactions: Transaction[];
  selectedCurrency: Currency;
  onDeleteTransaction: (id: string) => Promise<void>;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  monthTransactions,
  selectedCurrency,
  onDeleteTransaction
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter((t) => {
      const matchesSearch =
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [monthTransactions, searchQuery, categoryFilter]);

  return (
    <div className="glass-card p-6 rounded-3xl space-y-6">
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Historial de Movimientos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Registros individuales de gastos e ingresos del período</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-60">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-600 dark:text-cyan-400">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Buscar movimiento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-bold focus:outline-none cursor-pointer"
          >
            <option value="all" className="dark:bg-slate-900">Todas las Categorías</option>
            {CATEGORY_PALETTE.map((cat) => (
              <option key={cat.name} value={cat.name} className="dark:bg-slate-900">
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-xs font-semibold">
          No se encontraron movimientos en este período.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredTransactions.map((trans) => {
                const categoryObj = CATEGORY_PALETTE.find((c) => c.name === trans.category);
                return (
                  <tr key={trans.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">{trans.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          trans.type === 'income'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60'
                        }`}
                      >
                        {trans.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-800 dark:text-slate-100">
                      <span className="mr-1.5">{categoryObj?.icon || '📌'}</span>
                      {trans.category}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">{trans.description}</td>
                    <td
                      className={`py-3 px-4 text-right font-black text-sm ${
                        trans.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {trans.type === 'income' ? '+' : '-'}
                      {selectedCurrency.symbol}
                      {Number(trans.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onDeleteTransaction(trans.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition cursor-pointer"
                        title="Eliminar"
                      >
                        <Icons.Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
