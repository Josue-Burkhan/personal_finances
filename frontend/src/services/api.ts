import { Transaction, AllocationRule, BudgetsMap, Currency } from '../types/finance';

const BASE_URL = '/api';

export const api = {
  // Transactions
  async getTransactions(month?: string): Promise<Transaction[]> {
    const url = month ? `${BASE_URL}/transactions?month=${month}` : `${BASE_URL}/transactions`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener transacciones');
    return res.json();
  },

  async createTransaction(trans: Omit<Transaction, 'id' | 'month'>): Promise<Transaction> {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trans),
    });
    if (!res.ok) throw new Error('Error al crear transacción');
    return res.json();
  },

  async deleteTransaction(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar transacción');
  },

  // Rules
  async getRules(): Promise<AllocationRule[]> {
    const res = await fetch(`${BASE_URL}/rules`);
    if (!res.ok) throw new Error('Error al obtener reglas');
    return res.json();
  },

  async createRule(rule: Omit<AllocationRule, 'id'>): Promise<AllocationRule> {
    const res = await fetch(`${BASE_URL}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    if (!res.ok) throw new Error('Error al crear regla');
    return res.json();
  },

  async updateRulePercent(id: string, percent: number): Promise<AllocationRule> {
    const res = await fetch(`${BASE_URL}/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ percent }),
    });
    if (!res.ok) throw new Error('Error al actualizar regla');
    return res.json();
  },

  async deleteRule(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/rules/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar regla');
  },

  // Budgets
  async getBudgets(): Promise<BudgetsMap> {
    const res = await fetch(`${BASE_URL}/budgets`);
    if (!res.ok) throw new Error('Error al obtener presupuestos');
    return res.json();
  },

  async updateBudget(month: string, type: 'income' | 'expense', category: string, amount: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, type, category, amount }),
    });
    if (!res.ok) throw new Error('Error al actualizar presupuesto');
  },

  async copyBudget(targetMonth: string, sourceMonth: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/budgets/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetMonth, sourceMonth }),
    });
    if (!res.ok) throw new Error('Error al copiar presupuesto del mes anterior');
  },

  // Settings
  async getCurrency(): Promise<Currency> {
    const res = await fetch(`${BASE_URL}/settings/currency`);
    if (!res.ok) throw new Error('Error al obtener la moneda');
    return res.json();
  },

  async saveCurrency(currency: Currency): Promise<void> {
    const res = await fetch(`${BASE_URL}/settings/currency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currency),
    });
    if (!res.ok) throw new Error('Error al guardar la moneda');
  }
};
