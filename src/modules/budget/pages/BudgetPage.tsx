import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

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

export default function BudgetPage() {
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
              <Icon name="TrendingDown" className="text-emerald-600" size={24} />
              <span className="text-2xl font-bold">{formatCurrency(totalSpent)}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Израсходовано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Percent" className="text-purple-600" size={24} />
              <span className="text-2xl font-bold">{totalUtilization}%</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Освоение</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Структура бюджета</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetItems.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-sm text-gray-600">
                    {formatCurrency(item.spent)} / {formatCurrency(item.planned)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={item.utilizationRate} className="flex-1" />
                  <span className="text-sm font-medium w-12 text-right">
                    {item.utilizationRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
