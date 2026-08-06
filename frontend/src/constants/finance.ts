import { Currency, CategoryPaletteItem } from '../types/finance';

export const CURRENCIES: Currency[] = [
  { id: 'USD', symbol: '$', name: 'USD ($)', code: 'USD' },
  { id: 'PEN', symbol: 'S/', name: 'PEN (S/)', code: 'PEN' },
  { id: 'MXN', symbol: '$', name: 'MXN ($)', code: 'MXN' },
  { id: 'EUR', symbol: '€', name: 'EUR (€)', code: 'EUR' }
];

export const CATEGORY_PALETTE: CategoryPaletteItem[] = [
  { name: 'Sueldo / Salario', color: '#10b981', icon: '💼' },
  { name: 'Ventas / Negocio', color: '#06b6d4', icon: '🏪' },
  { name: 'Freelance / Servicios', color: '#0071e3', icon: '💻' },
  { name: 'Inversiones / Rendimientos', color: '#af52de', icon: '📈' },
  { name: 'Otros Ingresos', color: '#6366f1', icon: '✨' },
  { name: 'Diezmo / Donaciones', color: '#a855f7', icon: '⛪' },
  { name: 'Vivienda / Alquiler', color: '#f59e0b', icon: '🏠' },
  { name: 'Alimentación / Supermercado', color: '#ff3b30', icon: '🛒' },
  { name: 'Servicios Básicos (Luz, Agua, Net)', color: '#eab308', icon: '⚡' },
  { name: 'Transporte / Combustible', color: '#0ea5e9', icon: '🚗' },
  { name: 'Salud y Medicina', color: '#f43f5e', icon: '💊' },
  { name: 'Educación / Cursos', color: '#2563eb', icon: '📚' },
  { name: 'Entretenimiento y Ocio', color: '#ec4899', icon: '🎬' },
  { name: 'Ahorro / Inversión', color: '#34c759', icon: '🏦' },
  { name: 'Deudas / Préstamos', color: '#6b7280', icon: '💳' },
  { name: 'Otros Gastos', color: '#9ca3af', icon: '📦' }
];

export const DEFAULT_INCOME_CATEGORIES = CATEGORY_PALETTE.slice(0, 5).map(c => c.name);
export const DEFAULT_EXPENSE_CATEGORIES = CATEGORY_PALETTE.slice(5).map(c => c.name);
