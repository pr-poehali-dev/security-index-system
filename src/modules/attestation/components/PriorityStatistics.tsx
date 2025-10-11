import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TaskStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface PriorityStatisticsProps {
  statistics: TaskStatistics;
}

export default function PriorityStatistics({ statistics }: PriorityStatisticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика по приоритетам</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700 dark:text-red-300">Критический</span>
              <Badge className="bg-red-600 text-white">{statistics.critical}</Badge>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">Требуют немедленных действий</p>
          </div>

          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Высокий</span>
              <Badge className="bg-orange-600 text-white">{statistics.high}</Badge>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">Требуют срочного внимания</p>
          </div>

          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Средний</span>
              <Badge className="bg-amber-600 text-white">{statistics.medium}</Badge>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">Требуют планирования</p>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Низкий</span>
              <Badge className="bg-blue-600 text-white">{statistics.low}</Badge>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">Можно выполнить позже</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
