// src/stores/budgetStore.ts
// Описание: Zustand store для управления бюджетом и расходами
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BudgetCategory, BudgetExpense, BudgetSummary, OrganizationBudgetPlan } from '@/types';

const currentYear = new Date().getFullYear();

const mockCategories: BudgetCategory[] = [
  {
    id: 'cat-1',
    tenantId: 'tenant-1',
    name: 'Пожарная безопасность',
    description: 'Расходы на обеспечение пожарной безопасности',
    plannedAmount: 5000000,
    year: currentYear,
    color: '#ef4444',
    status: 'active',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    id: 'cat-2',
    tenantId: 'tenant-1',
    name: 'Обслуживание оборудования',
    description: 'ТО и ремонт оборудования',
    plannedAmount: 3500000,
    year: currentYear,
    color: '#3b82f6',
    status: 'active',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    id: 'cat-3',
    tenantId: 'tenant-1',
    name: 'Обучение персонала',
    description: 'Обучение и аттестация',
    plannedAmount: 1500000,
    year: currentYear,
    color: '#10b981',
    status: 'active',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    id: 'cat-4',
    tenantId: 'tenant-1',
    name: 'Экспертизы и проверки',
    description: 'Независимые экспертизы',
    plannedAmount: 2000000,
    year: currentYear,
    color: '#8b5cf6',
    status: 'active',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    id: 'cat-5',
    tenantId: 'tenant-1',
    name: 'СИЗ и спецодежда',
    description: 'Средства индивидуальной защиты',
    plannedAmount: 4000000,
    year: currentYear,
    color: '#f59e0b',
    status: 'active',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  }
];

const mockExpenses: BudgetExpense[] = [
  {
    id: 'exp-1',
    tenantId: 'tenant-1',
    categoryId: 'cat-1',
    amount: 450000,
    description: 'Закупка огнетушителей',
    expenseDate: '2025-01-15',
    documentNumber: 'ИСХ-001',
    sourceType: 'manual',
    createdBy: 'user-1',
    organizationId: 'org-1',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15'
  },
  {
    id: 'exp-2',
    tenantId: 'tenant-1',
    categoryId: 'cat-2',
    amount: 280000,
    description: 'ТО компрессорного оборудования',
    expenseDate: '2025-01-20',
    documentNumber: 'ИСХ-002',
    sourceType: 'manual',
    createdBy: 'user-1',
    organizationId: 'org-1',
    createdAt: '2025-01-20',
    updatedAt: '2025-01-20'
  },
  {
    id: 'exp-3',
    tenantId: 'tenant-1',
    categoryId: 'cat-3',
    amount: 95000,
    description: 'Обучение по охране труда',
    expenseDate: '2025-02-01',
    documentNumber: 'ИСХ-003',
    sourceType: 'manual',
    createdBy: 'user-1',
    organizationId: 'org-1',
    createdAt: '2025-02-01',
    updatedAt: '2025-02-01'
  },
  {
    id: 'exp-4',
    tenantId: 'tenant-1',
    categoryId: 'cat-1',
    amount: 1200000,
    description: 'Монтаж системы пожарной сигнализации',
    expenseDate: '2025-02-10',
    documentNumber: 'ИСХ-004',
    sourceType: 'manual',
    createdBy: 'user-1',
    organizationId: 'org-1',
    createdAt: '2025-02-10',
    updatedAt: '2025-02-10'
  },
  {
    id: 'exp-5',
    tenantId: 'tenant-1',
    categoryId: 'cat-5',
    amount: 350000,
    description: 'Закупка спецодежды',
    expenseDate: '2025-02-15',
    documentNumber: 'ИСХ-005',
    sourceType: 'manual',
    createdBy: 'user-1',
    organizationId: 'org-1',
    createdAt: '2025-02-15',
    updatedAt: '2025-02-15'
  }
];

interface BudgetState {
  categories: BudgetCategory[];
  expenses: BudgetExpense[];
  organizationPlans: OrganizationBudgetPlan[];
  selectedYear: number;

  getCategoriesByYear: (year: number) => BudgetCategory[];
  getExpensesByYear: (year: number) => BudgetExpense[];

  addCategory: (category: Omit<BudgetCategory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (id: string, updates: Partial<BudgetCategory>) => void;
  deleteCategory: (id: string) => void;

  addExpense: (expense: Omit<BudgetExpense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, updates: Partial<BudgetExpense>) => void;
  deleteExpense: (id: string) => void;

  addOrganizationPlan: (plan: Omit<OrganizationBudgetPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrganizationPlan: (id: string, updates: Partial<OrganizationBudgetPlan>) => void;
  deleteOrganizationPlan: (id: string) => void;

  setSelectedYear: (year: number) => void;
}

export const useBudgetStore = create<BudgetState>()(persist((set, get) => ({
  categories: mockCategories,
  expenses: mockExpenses,
  organizationPlans: [],
  selectedYear: currentYear,

  getCategoriesByYear: (year) => {
    return get().categories.filter((cat) => cat.year === year);
  },

  getExpensesByYear: (year) => {
    const categoryIds = get().categories
      .filter((cat) => cat.year === year)
      .map((cat) => cat.id);
    return get().expenses.filter((exp) => categoryIds.includes(exp.categoryId));
  },

  addCategory: (category) => {
    const newCategory: BudgetCategory = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ categories: [...state.categories, newCategory] }));
  },

  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === id ? { ...cat, ...updates, updatedAt: new Date().toISOString() } : cat
      )
    }));
  },

  deleteCategory: (id) => {
    set((state) => ({ categories: state.categories.filter((cat) => cat.id !== id) }));
  },



  addExpense: (expense) => {
    const newExpense: BudgetExpense = {
      ...expense,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ expenses: [...state.expenses, newExpense] }));
  },

  updateExpense: (id, updates) => {
    set((state) => ({
      expenses: state.expenses.map((exp) =>
        exp.id === id ? { ...exp, ...updates, updatedAt: new Date().toISOString() } : exp
      )
    }));
  },

  deleteExpense: (id) => {
    set((state) => ({ expenses: state.expenses.filter((exp) => exp.id !== id) }));
  },



  addOrganizationPlan: (plan) => {
    const newPlan: OrganizationBudgetPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ organizationPlans: [...state.organizationPlans, newPlan] }));
  },

  updateOrganizationPlan: (id, updates) => {
    set((state) => ({
      organizationPlans: state.organizationPlans.map((plan) =>
        plan.id === id ? { ...plan, ...updates, updatedAt: new Date().toISOString() } : plan
      )
    }));
  },

  deleteOrganizationPlan: (id) => {
    set((state) => ({ 
      organizationPlans: state.organizationPlans.filter((plan) => plan.id !== id) 
    }));
  },





  setSelectedYear: (year) => {
    set({ selectedYear: year });
  }

}), { name: 'budget-storage-v1' }));