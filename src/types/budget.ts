// src/types/budget.ts
export type BudgetCategory = 'safety' | 'maintenance' | 'training' | 'examination' | 'equipment' | 'other';
export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly';
export type ExpenseStatus = 'planned' | 'approved' | 'spent' | 'cancelled';

export interface Budget {
  id: string;
  tenantId: string;
  year: number;
  period: BudgetPeriod;
  totalAmount: number;
  spentAmount: number;
  items: BudgetItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'approved' | 'active' | 'closed';
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  category: BudgetCategory;
  subcategory?: string;
  plannedAmount: number;
  spentAmount: number;
  organizationId?: string;
  organizationName?: string;
  objectId?: string;
  objectName?: string;
  description?: string;
}

export interface Expense {
  id: string;
  budgetId: string;
  budgetItemId: string;
  category: BudgetCategory;
  amount: number;
  date: string;
  description: string;
  status: ExpenseStatus;
  sourceType: 'maintenance' | 'examination' | 'training' | 'manual';
  sourceId?: string;
  documentNumber?: string;
  documentUrl?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface BudgetStats {
  totalBudget: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationRate: number;
  byCategory: Record<BudgetCategory, { planned: number; spent: number }>;
  monthlyTrend: { month: string; spent: number }[];
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  type: 'approaching_limit' | 'exceeded' | 'low_balance';
  category?: BudgetCategory;
  message: string;
  threshold: number;
  currentValue: number;
  severity: 'warning' | 'critical';
  createdAt: string;
}