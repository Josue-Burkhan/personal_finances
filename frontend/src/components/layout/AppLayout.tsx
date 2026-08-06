import React from 'react';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { ThemeToggle } from '../common/ThemeToggle';
import { Currency } from '../../types/finance';

interface AppLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onOpenAddModal: () => void;
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  totalActualIncome: number;
  totalActualExpense: number;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  collapsed,
  setCollapsed,
  selectedCurrency,
  onCurrencyChange,
  onOpenAddModal,
  currentMonth,
  setCurrentMonth,
  totalActualIncome,
  totalActualExpense,
  children
}) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f8f9] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
      {/* FIXED SIDEBAR (Left Column) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={onCurrencyChange}
        onOpenAddModal={onOpenAddModal}
      />

      {/* MAIN CONTENT AREA (Right Column) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        {/* Header */}
        <Header
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          totalActualIncome={totalActualIncome}
          totalActualExpense={totalActualExpense}
          selectedCurrency={selectedCurrency}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Dynamic Page Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* FIXED FLOATING THEME TOGGLE (Bottom Right Corner) */}
      <ThemeToggle />
    </div>
  );
};
