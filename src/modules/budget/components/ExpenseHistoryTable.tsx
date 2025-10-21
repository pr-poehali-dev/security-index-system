import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useBudgetStore } from '@/stores/budgetStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { BudgetExpense } from '@/types';

interface ExpenseHistoryTableProps {
  year: number;
}

export default function ExpenseHistoryTable({ year }: ExpenseHistoryTableProps) {
  const { expenses, categories, deleteExpense } = useBudgetStore();
  const { organizations } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const yearCategories = categories.filter(c => c.year === year && c.status === 'active');
  
  const filteredExpenses = useMemo(() => {
    const result = expenses.filter(exp => {
      const category = categories.find(c => c.id === exp.categoryId);
      if (!category || category.year !== year) return false;

      if (selectedCategory !== 'all' && exp.categoryId !== selectedCategory) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          exp.description.toLowerCase().includes(query) ||
          exp.documentNumber?.toLowerCase().includes(query) ||
          category.name.toLowerCase().includes(query)
        );
      }

      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'date') {
        const diff = new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime();
        return sortOrder === 'asc' ? diff : -diff;
      } else {
        const diff = a.amount - b.amount;
        return sortOrder === 'asc' ? diff : -diff;
      }
    });

    return result;
  }, [expenses, categories, year, searchQuery, selectedCategory, sortBy, sortOrder]);

  const handleDelete = (id: string) => {
    if (confirm('Удалить запись о расходе?')) {
      deleteExpense(id);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Неизвестно';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || '#gray';
  };

  const getOrganizationName = (orgId?: string) => {
    if (!orgId) return '—';
    const org = organizations.find(o => o.id === orgId);
    return org?.shortName || org?.fullName || '—';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>История расходов</CardTitle>
          <Badge variant="outline" className="text-base">
            {filteredExpenses.length} записей
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Поиск по описанию, документу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {yearCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'amount')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">По дате</SelectItem>
                <SelectItem value="amount">По сумме</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <Icon name={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={16} />
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">Итого по фильтру:</span>
          <span className="text-lg font-bold text-blue-900">{formatCurrency(totalAmount)}</span>
        </div>

        <div className="space-y-2">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon name="FileSearch" size={48} className="mx-auto mb-2 opacity-50" />
              <p>Расходы не найдены</p>
              <p className="text-sm">Измените параметры фильтрации или добавьте новые расходы</p>
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <Card key={expense.id} className="border-l-4" style={{ borderLeftColor: getCategoryColor(expense.categoryId) }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(expense.categoryId)}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatDate(expense.expenseDate)}</span>
                        {expense.sourceType === 'incident' && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Icon name="AlertCircle" size={10} />
                            Из инцидента
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium mb-1">{expense.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {expense.documentNumber && (
                          <span className="flex items-center gap-1">
                            <Icon name="FileText" size={14} />
                            {expense.documentNumber}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Icon name="Building2" size={14} />
                          {getOrganizationName(expense.organizationId)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(expense.amount)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}