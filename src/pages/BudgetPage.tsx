import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

export default function BudgetPage() {
  const budgetItems = [
    { category: 'Безопасность', planned: 5000000, spent: 3200000, utilizationRate: 64 },
    { category: 'Обслуживание', planned: 3500000, spent: 2800000, utilizationRate: 80 },
    { category: 'Обучение', planned: 1500000, spent: 950000, utilizationRate: 63 },
    { category: 'Экспертизы', planned: 2000000, spent: 1600000, utilizationRate: 80 },
    { category: 'Оборудование', planned: 4000000, spent: 2100000, utilizationRate: 53 }
  ];

  const totalPlanned = budgetItems.reduce((sum, item) => sum + item.planned, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const totalUtilization = Math.round((totalSpent / totalPlanned) * 100);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div>
      <PageHeader
        title="Планирование бюджета"
        description="Формирование и контроль бюджета на мероприятия по безопасности"
        icon="Wallet"
        action={
          <Button className="gap-2">
            <Icon name="Plus" size={18} />
            Добавить расход
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Wallet" className="text-blue-600" size={24} />
              <span className="text-2xl font-bold">{formatCurrency(totalPlanned)}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Запланировано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="TrendingDown" className="text-orange-600" size={24} />
              <span className="text-2xl font-bold">{formatCurrency(totalSpent)}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Израсходовано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="PieChart" className="text-emerald-600" size={24} />
              <span className="text-2xl font-bold">{totalUtilization}%</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Освоение бюджета</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Бюджет по категориям (2025 год)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {budgetItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.category}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(item.spent)} из {formatCurrency(item.planned)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.utilizationRate}%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Остаток: {formatCurrency(item.planned - item.spent)}
                    </p>
                  </div>
                </div>
                <Progress value={item.utilizationRate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Последние расходы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: 'Экспертиза ПБ - Котельная №1', amount: 450000, date: '2025-10-03', category: 'Экспертизы' },
                { title: 'Ремонт затвора - ГТС-01', amount: 320000, date: '2025-10-02', category: 'Обслуживание' },
                { title: 'Обучение персонала', amount: 125000, date: '2025-10-01', category: 'Обучение' }
              ].map((expense, index) => (
                <div key={index} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{expense.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{expense.category}</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(expense.amount)}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{new Date(expense.date).toLocaleDateString('ru-RU')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Предупреждения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <Icon name="AlertTriangle" className="text-amber-600 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-sm text-amber-900 dark:text-amber-200">Приближение к лимиту</p>
                    <p className="text-xs text-amber-800 dark:text-amber-300">Категория "Обслуживание" освоена на 80%</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <Icon name="AlertTriangle" className="text-amber-600 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-sm text-amber-900 dark:text-amber-200">Приближение к лимиту</p>
                    <p className="text-xs text-amber-800 dark:text-amber-300">Категория "Экспертизы" освоена на 80%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
