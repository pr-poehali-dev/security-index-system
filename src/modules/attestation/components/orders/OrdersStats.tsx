import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface OrdersStatsProps {
  total: number;
  draft: number;
  active: number;
  completed: number;
}

export default function OrdersStats({ total, draft, active, completed }: OrdersStatsProps) {
  const stats = [
    {
      label: 'Всего приказов',
      value: total,
      icon: 'FileText' as const,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      label: 'Черновики',
      value: draft,
      icon: 'FilePenLine' as const,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-950/20'
    },
    {
      label: 'Активные',
      value: active,
      icon: 'FileCheck' as const,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      label: 'Выполнено',
      value: completed,
      icon: 'CheckCircle' as const,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20'
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
