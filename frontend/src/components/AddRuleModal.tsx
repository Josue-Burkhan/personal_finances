import React, { useState } from 'react';
import { Icons } from './Icons';
import { DEFAULT_EXPENSE_CATEGORIES } from '../constants/finance';

interface AddRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ruleData: {
    name: string;
    percent: number;
    color: string;
    icon: string;
    defaultCategory: string;
  }) => Promise<void>;
}

export const AddRuleModal: React.FC<AddRuleModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [percent, setPercent] = useState('10');
  const [icon, setIcon] = useState('🎯');
  const [defaultCategory, setDefaultCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !percent) return;

    await onSubmit({
      name,
      percent: parseFloat(percent),
      color: '#0891b2',
      icon,
      defaultCategory
    });

    setName('');
    setPercent('10');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-extrabold">Nueva Regla de %</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <Icons.X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Nombre de la Regla</label>
            <input
              type="text"
              required
              placeholder="Ej: Inversión, Fondo de Emergencia, Viajes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Porcentaje (%)</label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2.5 text-xs text-slate-900 dark:text-slate-100 font-extrabold focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Icono</label>
              <input
                type="text"
                maxLength={2}
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2.5 text-xs text-center font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Categoría por Defecto</label>
            <select
              value={defaultCategory}
              onChange={(e) => setDefaultCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-slate-900">
                  {cat}
                </option>
              ))}
            </select>
          </div>

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
              Crear Regla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
