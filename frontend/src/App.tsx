import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './components/DashboardView';
import { PercentControlView } from './components/PercentControlView';
import { BudgetView } from './components/BudgetView';
import { TransactionsView } from './components/TransactionsView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddRuleModal } from './components/AddRuleModal';
import { api } from './services/api';
import { Transaction, AllocationRule, BudgetsMap, Currency } from './types/finance';
import { CURRENCIES } from './constants/finance';

export default function App() {
  const [currentMonth, setCurrentMonth] = useState('2026-08');
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, budget, transactions, percent_control
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Data States
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allocationRules, setAllocationRules] = useState<AllocationRule[]>([]);
  const [budgets, setBudgets] = useState<BudgetsMap>({});
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<{
    type: 'income' | 'expense';
    category: string;
    amount: string;
    description: string;
    date: string;
    ruleId: string;
  } | undefined>(undefined);

  // Load Data from Backend API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [transData, rulesData, budgetsData, currData] = await Promise.all([
        api.getTransactions(),
        api.getRules(),
        api.getBudgets(),
        api.getCurrency().catch(() => CURRENCIES[0])
      ]);

      setTransactions(transData);
      setAllocationRules(rulesData);
      setBudgets(budgetsData);
      setSelectedCurrency(currData || CURRENCIES[0]);
    } catch (err) {
      console.error('Error al cargar datos desde el backend:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleCurrencyChange = async (newCurr: Currency) => {
    setSelectedCurrency(newCurr);
    try {
      await api.saveCurrency(newCurr);
    } catch (err) {
      console.error('Error guardando moneda:', err);
    }
  };

  const handleCreateTransaction = async (transData: {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
    ruleId?: string | null;
  }) => {
    try {
      const created = await api.createTransaction(transData);
      setTransactions((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Error al guardar movimiento:', err);
      alert('Error al guardar movimiento en la base de datos.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error al eliminar movimiento:', err);
    }
  };

  const handleCreateRule = async (ruleData: {
    name: string;
    percent: number;
    color: string;
    icon: string;
    defaultCategory: string;
  }) => {
    try {
      const created = await api.createRule(ruleData);
      setAllocationRules((prev) => [...prev, created]);
    } catch (err) {
      console.error('Error al crear regla:', err);
    }
  };

  const handleUpdateRulePercent = async (id: string, percent: number) => {
    setAllocationRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, percent } : r))
    );
    try {
      await api.updateRulePercent(id, percent);
    } catch (err) {
      console.error('Error al actualizar % de regla:', err);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await api.deleteRule(id);
      setAllocationRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Error al eliminar regla:', err);
    }
  };

  const handleUpdateBudget = async (
    type: 'income' | 'expense',
    category: string,
    amountStr: string
  ) => {
    const amount = parseFloat(amountStr) || 0;
    setBudgets((prev) => ({
      ...prev,
      [currentMonth]: {
        ...prev[currentMonth],
        [type]: {
          ...(prev[currentMonth]?.[type] || {}),
          [category]: amount
        }
      }
    }));

    try {
      await api.updateBudget(currentMonth, type, category, amount);
    } catch (err) {
      console.error('Error al actualizar presupuesto:', err);
    }
  };

  const handleCopyPreviousMonthBudget = async () => {
    const dateObj = new Date(`${currentMonth}-01`);
    dateObj.setMonth(dateObj.getMonth() - 1);
    const prevMonthStr = dateObj.toISOString().substring(0, 7);

    try {
      await api.copyBudget(currentMonth, prevMonthStr);
      const updatedBudgets = await api.getBudgets();
      setBudgets(updatedBudgets);
    } catch (err: any) {
      alert(err.message || `No hay plantilla en el mes anterior (${prevMonthStr}).`);
    }
  };

  // Filtered month transactions & calculations
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.month === currentMonth);
  }, [transactions, currentMonth]);

  const totalActualIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [monthTransactions]);

  const totalActualExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [monthTransactions]);

  const netSavings = totalActualIncome - totalActualExpense;

  const currentBudget = useMemo(() => {
    return budgets[currentMonth] || { income: {}, expense: {} };
  }, [budgets, currentMonth]);

  const totalPlannedIncome = useMemo(() => {
    return Object.values(currentBudget.income || {}).reduce((a, b) => a + Number(b || 0), 0);
  }, [currentBudget]);

  const totalPlannedExpense = useMemo(() => {
    return Object.values(currentBudget.expense || {}).reduce((a, b) => a + Number(b || 0), 0);
  }, [currentBudget]);

  const totalAllocationsPercent = allocationRules.reduce(
    (a, b) => a + Number(b.percent || 0),
    0
  );

  const handleOpenQuickAddModal = (rule: AllocationRule, pendingAmount: number) => {
    setModalInitialData({
      type: 'expense',
      category: rule.defaultCategory,
      amount: pendingAmount.toFixed(2),
      description: `Aporte ${rule.name}`,
      date: new Date().toISOString().split('T')[0],
      ruleId: rule.id
    });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8f9] dark:bg-[#090d16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-cyan-600 dark:text-cyan-400 text-sm font-extrabold">
          <div className="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin" />
          <span>Cargando datos...</span>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      selectedCurrency={selectedCurrency}
      onCurrencyChange={handleCurrencyChange}
      onOpenAddModal={() => {
        setModalInitialData(undefined);
        setShowAddModal(true);
      }}
      currentMonth={currentMonth}
      setCurrentMonth={setCurrentMonth}
      totalActualIncome={totalActualIncome}
      totalActualExpense={totalActualExpense}
    >
      {activeTab === 'dashboard' && (
        <DashboardView
          monthTransactions={monthTransactions}
          totalActualIncome={totalActualIncome}
          totalActualExpense={totalActualExpense}
          totalPlannedIncome={totalPlannedIncome}
          totalPlannedExpense={totalPlannedExpense}
          netSavings={netSavings}
          totalAllocationsPercent={totalAllocationsPercent}
          allocationRules={allocationRules}
          selectedCurrency={selectedCurrency}
          setActiveTab={setActiveTab}
          onQuickAddTransaction={(ruleWithPending) =>
            handleOpenQuickAddModal(ruleWithPending, ruleWithPending.pendingAmount)
          }
          currentBudget={currentBudget}
        />
      )}

      {activeTab === 'percent_control' && (
        <PercentControlView
          allocationRules={allocationRules}
          monthTransactions={monthTransactions}
          totalActualIncome={totalActualIncome}
          selectedCurrency={selectedCurrency}
          onUpdateRulePercent={handleUpdateRulePercent}
          onDeleteRule={handleDeleteRule}
          onOpenAddRuleModal={() => setShowAddRuleModal(true)}
          onRegisterPending={(rule, pending) => handleOpenQuickAddModal(rule, pending)}
        />
      )}

      {activeTab === 'budget' && (
        <BudgetView
          currentMonth={currentMonth}
          budgets={budgets}
          monthTransactions={monthTransactions}
          selectedCurrency={selectedCurrency}
          totalPlannedIncome={totalPlannedIncome}
          totalActualIncome={totalActualIncome}
          totalPlannedExpense={totalPlannedExpense}
          totalActualExpense={totalActualExpense}
          onUpdateBudget={handleUpdateBudget}
          onCopyPreviousMonthBudget={handleCopyPreviousMonthBudget}
        />
      )}

      {activeTab === 'transactions' && (
        <TransactionsView
          monthTransactions={monthTransactions}
          selectedCurrency={selectedCurrency}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateTransaction}
        selectedCurrency={selectedCurrency}
        rules={allocationRules}
        initialData={modalInitialData}
      />

      <AddRuleModal
        isOpen={showAddRuleModal}
        onClose={() => setShowAddRuleModal(false)}
        onSubmit={handleCreateRule}
      />
    </AppLayout>
  );
}
