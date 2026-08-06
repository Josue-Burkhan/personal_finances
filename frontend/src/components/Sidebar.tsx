import React from 'react';
import { Icons } from './Icons';
import { Currency } from '../types/finance';
import { CURRENCIES } from '../constants/finance';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onOpenAddModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  collapsed,
  setCollapsed,
  selectedCurrency,
  onCurrencyChange,
  onOpenAddModal
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'budget', label: 'Presupuesto', icon: Icons.ChartBar },
    { id: 'transactions', label: 'Movimientos', icon: Icons.Receipt },
    { id: 'percent_control', label: 'Control de Porcentaje', icon: Icons.Percent }
  ];

  return (
    <>
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 h-full glass-sidebar text-slate-900 dark:text-slate-100 p-4 flex flex-col justify-between transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Top: Logo & Nav Links */}
        <div className="space-y-6">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 flex-shrink-0">
                <Icons.Sparkles className="w-5 h-5" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                    Finanzas
                  </h1>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action CTA */}
          <button
            onClick={() => {
              onOpenAddModal();
              setSidebarOpen(false);
            }}
            className={`w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-cyan-600/20 transition active:scale-95 flex items-center justify-center cursor-pointer ${
              collapsed ? 'p-3' : 'py-3 px-4 gap-2'
            }`}
            title="Nuevo Movimiento"
          >
            <Icons.Plus className="w-4 h-4" />
            {!collapsed && <span>Nuevo Movimiento</span>}
          </button>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? tab.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  {!collapsed && <span className="truncate">{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Currency Selector & Desktop Collapse Toggle */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
          {/* Currency Switcher */}
          <div
            className={`flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 ${
              collapsed ? 'flex-col items-center justify-center' : ''
            }`}
          >
            <Icons.Coins className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
            {!collapsed ? (
              <select
                value={selectedCurrency.id}
                onChange={(e) => {
                  const found = CURRENCIES.find((c) => c.id === e.target.value);
                  if (found) onCurrencyChange(found);
                }}
                className="w-full bg-transparent text-xs font-extrabold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.id} value={curr.id} className="dark:bg-slate-900 dark:text-white">
                    {curr.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-100">{selectedCurrency.symbol}</span>
            )}
          </div>

          {/* Desktop Toggle Button ONLY at the bottom of the Sidebar */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center justify-center gap-2 py-2 px-3 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition cursor-pointer"
            title={collapsed ? "Expandir menú" : "Plegar menú"}
          >
            <Icons.Sidebar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            {!collapsed && <span>Plegar Menú</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}
    </>
  );
};
