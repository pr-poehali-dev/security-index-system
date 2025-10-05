import { create } from 'zustand';
import type { Budget } from '@/types';

interface BudgetState {
  budgets: Budget[];
  selectedYear: number;
  selectedQuarter: Budget['quarter'] | 'all';
  setSelectedYear: (year: number) => void;
  setSelectedQuarter: (quarter: Budget['quarter'] | 'all') => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getBudgetsByYear: (year: number) => Budget[];
  getBudgetsByCategory: (category: Budget['category']) => Budget[];
  getBudgetStats: (year: number) => {
    totalPlanned: number;
    totalActual: number;
    utilization: number;
    byCategory: Record<Budget['category'], { planned: number; actual: number; utilization: number }>;
  };
}

const MOCK_BUDGETS: Budget[] = [
  {
    id: 'budget-1',
    tenantId: 'tenant-1',
    year: 2024,
    category: 'attestation',
    planned: 500000,
    actual: 380000,
    quarter: 1
  },
  {
    id: 'budget-2',
    tenantId: 'tenant-1',
    year: 2024,
    category: 'attestation',
    planned: 500000,
    actual: 420000,
    quarter: 2
  },
  {
    id: 'budget-3',
    tenantId: 'tenant-1',
    year: 2024,
    category: 'attestation',
    planned: 500000,
    actual: 250000,
    quarter: 3
  },
  {
    id: 'budget-4',
    tenantId: 'tenant-1',
    year: 2024,
    category: 'attestation',
    planned: 500000,
    actual: 0,
    quarter: 4
  },
  {
    id: 'budget-5',
    tenantId: 'tenant-1',
    year: 2024,
    category: 'maintenance',
    planned: 1200000,
    actual: 980000,
    quarter: 1
  },
  {
    id: 'budget-6',
    tenantId: 'tenant-1',
    year: 2024,
    category: 'maintenance',
    planned: 1200000,
    actual: 1150000,
    quarter: 2
  },
  {
    id: 'budget-7',
    tenantId: 'tenant-1',
    year: 2024,
    category: 'maintenance',
    planned: 1200000,
    actual: 850000,
    quarter: 3
  },
  {
    id: 'budget-8',
    tenantId: 'tenant-1',
    year: 2024,
    category: 'equipment',
    planned: 3000000,
    actual: 2800000,
    quarter: 2
  },
  {
    id: 'budget-9',
    tenantId: 'tenant-1',
    year: 2024,
    category: 'training',
    planned: 300000,
    actual: 285000,
    quarter: 1
  },
  {
    id: 'budget-10',
    tenantId: 'tenant-1',
    year: 2024,
    category: 'training',
    planned: 300000,
    actual: 310000,
    quarter: 3
  },
  {
    id: 'budget-11',
    tenantId: 'tenant-1',
    year: 2024,
    category: 'other',
    planned: 400000,
    actual: 220000,
    quarter: 2
  }
];

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: MOCK_BUDGETS,
  selectedYear: 2024,
  selectedQuarter: 'all',

  setSelectedYear: (year) => set({ selectedYear: year }),

  setSelectedQuarter: (quarter) => set({ selectedQuarter: quarter }),

  addBudget: (budgetData) => set((state) => ({
    budgets: [
      ...state.budgets,
      {
        ...budgetData,
        id: `budget-${Date.now()}`
      }
    ]
  })),

  updateBudget: (id, updates) => set((state) => ({
    budgets: state.budgets.map((budget) =>
      budget.id === id ? { ...budget, ...updates } : budget
    )
  })),

  deleteBudget: (id) => set((state) => ({
    budgets: state.budgets.filter((budget) => budget.id !== id)
  })),

  getBudgetsByYear: (year) => {
    const { budgets, selectedQuarter } = get();
    return budgets.filter((budget) => {
      if (budget.year !== year) return false;
      if (selectedQuarter !== 'all' && budget.quarter !== selectedQuarter) return false;
      return true;
    });
  },

  getBudgetsByCategory: (category) => {
    const { selectedYear } = get();
    return get().budgets.filter(
      (budget) => budget.category === category && budget.year === selectedYear
    );
  },

  getBudgetStats: (year) => {
    const budgets = get().budgets.filter((b) => b.year === year);

    const stats = {
      totalPlanned: 0,
      totalActual: 0,
      utilization: 0,
      byCategory: {} as Record<Budget['category'], { planned: number; actual: number; utilization: number }>
    };

    const categories: Budget['category'][] = ['attestation', 'maintenance', 'equipment', 'training', 'other'];

    categories.forEach((category) => {
      const categoryBudgets = budgets.filter((b) => b.category === category);
      const planned = categoryBudgets.reduce((sum, b) => sum + b.planned, 0);
      const actual = categoryBudgets.reduce((sum, b) => sum + b.actual, 0);

      stats.byCategory[category] = {
        planned,
        actual,
        utilization: planned > 0 ? Math.round((actual / planned) * 100) : 0
      };

      stats.totalPlanned += planned;
      stats.totalActual += actual;
    });

    stats.utilization = stats.totalPlanned > 0 
      ? Math.round((stats.totalActual / stats.totalPlanned) * 100) 
      : 0;

    return stats;
  }
}));
