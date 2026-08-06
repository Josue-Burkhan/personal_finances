import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { Currency, AllocationRule } from '../types/finance';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES, CATEGORY_PALETTE } from '../constants/finance';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transData: {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
    ruleId?: string | null;
  }) => Promise<void>;
  selectedCurrency: Currency;
  rules: AllocationRule[];
  initialData?: {
    type: 'income' | 'expense';
    category: string;
    amount: string;
    description: string;
    date: string;
    ruleId: string;
  };
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedCurrency,
  rules,
  initialData
}) => {
  const [form, setForm] = useState({
    type: initialData?.type || ('expense' as 'income' | 'expense'),
    category: initialData?.category || '',
    amount: initialData?.amount || '',
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    ruleId: initialData?.ruleId || ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm({
        type: initialData?.type || 'expense',
        category: initialData?.category || '',
        amount: initialData?.amount || '',
        description: initialData?.description || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        ruleId: initialData?.ruleId || ''
      });
      setErrorMsg('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.category) {
      setErrorMsg('Debes seleccionar una categoría obligatoriamente.');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0.');
      return;
    }

    await onSubmit({
      type: form.type,
      category: form.category,
      amount: parseFloat(form.amount),
      description: form.description || form.category,
      date: form.date,
      ruleId: form.ruleId || null
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-extrabold">Nuevo Movimiento</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <Icons.X />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold p-3 rounded-2xl border border-rose-200 dark:border-rose-800">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Segmented Type Toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  type: 'expense',
                  category: ''
                }))
              }
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                form.type === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              🔴 Gasto
            </button>
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  type: 'income',
                  category: ''
                }))
              }
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                form.type === 'income'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              🟢 Ingreso
            </button>
          </div>

          {/* Amount Display */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Monto de la transacción
            </label>
            <div className="flex items-center gap-1">
              <span className="text-xl font-black text-slate-400">{selectedCurrency.symbol}</span>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                className="w-full bg-transparent text-2xl font-black text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Categoría</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="" disabled className="dark:bg-slate-900">
                  Seleccionar categoría...
                </option>
                {(form.type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES).map(
                  (cat) => {
                    const categoryObj = CATEGORY_PALETTE.find((c) => c.name === cat);
                    return (
                      <option key={cat} value={cat} className="dark:bg-slate-900">
                        {categoryObj?.icon || '📌'} {cat}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Fecha</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Descripción / Detalle</label>
            <input
              type="text"
              placeholder="Ej: Servicios de diseño, Freelance, Mercado"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          {/* Associated Rule (optional for expense) */}
          {form.type === 'expense' && (
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Asociar a Regla de % (Opcional)
              </label>
              <select
                value={form.ruleId}
                onChange={(e) => setForm((p) => ({ ...p, ruleId: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="" className="dark:bg-slate-900">Ninguna regla asociada</option>
                {rules.map((r) => (
                  <option key={r.id} value={r.id} className="dark:bg-slate-900">
                    {r.icon} {r.name} ({r.percent}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-2xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-md transition active:scale-95 cursor-pointer"
            >
              Guardar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
