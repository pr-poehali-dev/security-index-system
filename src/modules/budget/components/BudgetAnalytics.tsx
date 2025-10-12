import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useBudgetStore } from '@/stores/budgetStore';

interface BudgetAnalyticsProps {
  year: number;
}

export default function BudgetAnalytics({ year }: BudgetAnalyticsProps) {
  const { getBudgetSummary, getTotalPlanned, getTotalSpent, getTotalUtilization, expenses, categories } = useBudgetStore();

  const summary = getBudgetSummary(year);
  const totalPlanned = getTotalPlanned(year);
  const totalSpent = getTotalSpent(year);
  const totalUtilization = getTotalUtilization(year);
  const totalRemaining = totalPlanned - totalSpent;

  const yearCategories = categories.filter(c => c.year === year && c.status === 'active');
  const yearExpenses = expenses.filter(exp => {
    const category = categories.find(c => c.id === exp.categoryId);
    return category && category.year === year;
  });

  const currentMonth = new Date().getMonth();
  const monthsPassed = currentMonth + 1;
  const expectedUtilization = Math.round((monthsPassed / 12) * 100);
  const utilizationDiff = totalUtilization - expectedUtilization;

  const topSpendingCategory = summary.reduce((max, current) => 
    current.spentAmount > max.spentAmount ? current : max, 
    summary[0] || { categoryName: '—', spentAmount: 0 }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getUtilizationColor = (rate: number) => {
    if (rate < 50) return 'text-blue-600';
    if (rate < 80) return 'text-green-600';
    if (rate < 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (rate: number) => {
    if (rate < 50) return 'bg-blue-500';
    if (rate < 80) return 'bg-green-500';
    if (rate < 100) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Wallet" className="text-blue-600" size={24} />
              <div className="text-right">
                <div className="text-2xl font-bold">{formatCurrency(totalPlanned)}</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Запланировано</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="TrendingDown" className="text-emerald-600" size={24} />
              <div className="text-right">
                <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Израсходовано</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Banknote" className="text-purple-600" size={24} />
              <div className="text-right">
                <div className="text-2xl font-bold">{formatCurrency(totalRemaining)}</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Остаток</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Percent" className={`${getUtilizationColor(totalUtilization)}`} size={24} />
              <div className="text-right">
                <div className={`text-2xl font-bold ${getUtilizationColor(totalUtilization)}`}>
                  {totalUtilization}%
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Освоение</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="TrendingUp" size={18} />
              Прогноз освоения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Ожидаемое освоение</span>
                  <span className="font-medium">{expectedUtilization}%</span>
                </div>
                <Progress value={expectedUtilization} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Фактическое освоение</span>
                  <span className={`font-medium ${getUtilizationColor(totalUtilization)}`}>
                    {totalUtilization}%
                  </span>
                </div>
                <Progress value={totalUtilization} className={`h-2 ${getProgressColor(totalUtilization)}`} />
              </div>
              <div className={`text-sm ${utilizationDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {utilizationDiff >= 0 ? (
                  <span className="flex items-center gap-1">
                    <Icon name="ArrowUp" size={14} />
                    На {Math.abs(utilizationDiff)}% выше плана
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Icon name="ArrowDown" size={14} />
                    На {Math.abs(utilizationDiff)}% ниже плана
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="PieChart" size={18} />
              Статистика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Статей бюджета:</span>
                <span className="font-medium">{yearCategories.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Всего расходов:</span>
                <span className="font-medium">{yearExpenses.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Средний расход:</span>
                <span className="font-medium">
                  {yearExpenses.length > 0 
                    ? formatCurrency(totalSpent / yearExpenses.length)
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="text-gray-600">Топ категория:</span>
                <span className="font-medium text-right max-w-[150px] truncate">
                  {topSpendingCategory.categoryName}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="AlertTriangle" size={18} />
              Статус бюджета
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {totalUtilization < 70 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900">Нормальное освоение</p>
                  <p className="text-xs text-blue-700">Бюджет осваивается в пределах нормы</p>
                </div>
              )}
              {totalUtilization >= 70 && totalUtilization < 90 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-900">Требуется внимание</p>
                  <p className="text-xs text-yellow-700">Бюджет осваивается активно</p>
                </div>
              )}
              {totalUtilization >= 90 && totalUtilization < 100 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-orange-900">Близко к лимиту</p>
                  <p className="text-xs text-orange-700">Остаток: {formatCurrency(totalRemaining)}</p>
                </div>
              )}
              {totalUtilization >= 100 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-900">Превышение бюджета!</p>
                  <p className="text-xs text-red-700">Перерасход: {formatCurrency(Math.abs(totalRemaining))}</p>
                </div>
              )}
              {summary.filter(s => s.utilizationRate > 100).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-900">
                    Превышение в {summary.filter(s => s.utilizationRate > 100).length} категориях
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Структура бюджета по категориям</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.map((item) => (
              <div key={item.categoryId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: categories.find(c => c.id === item.categoryId)?.color 
                      }}
                    />
                    <span className="font-medium">{item.categoryName}</span>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-4">
                    <span>{formatCurrency(item.spentAmount)} / {formatCurrency(item.plannedAmount)}</span>
                    <span className={`font-medium w-12 text-right ${getUtilizationColor(item.utilizationRate)}`}>
                      {item.utilizationRate}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={item.utilizationRate > 100 ? 100 : item.utilizationRate} 
                  className={`h-2 ${getProgressColor(item.utilizationRate)}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
