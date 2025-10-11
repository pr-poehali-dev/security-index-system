import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface TrainingsStatsProps {
  total: number;
  planned: number;
  inProgress: number;
  totalCost: number;
}

export default function TrainingsStats({ total, planned, inProgress, totalCost }: TrainingsStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const stats = [
    {
      label: 'Всего обучений',
      value: total.toString(),
      icon: 'GraduationCap' as const,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      label: 'Запланировано',
      value: planned.toString(),
      icon: 'Calendar' as const,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20'
    },
    {
      label: 'В процессе',
      value: inProgress.toString(),
      icon: 'Clock' as const,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      label: 'Общая стоимость',
      value: formatCurrency(totalCost),
      icon: 'Wallet' as const,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon name={stat.icon} size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
