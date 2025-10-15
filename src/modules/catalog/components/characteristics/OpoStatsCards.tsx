import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { OpoStats } from './types';

interface OpoStatsCardsProps {
  stats: OpoStats;
}

export default function OpoStatsCards({ stats }: OpoStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего объектов</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Icon name="Building" size={24} className="text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Данных достаточно</p>
              <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{stats.sufficient}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Icon name="CheckCircle" size={24} className="text-green-600 dark:text-green-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Данных недостаточно</p>
              <p className="text-2xl font-bold mt-1 text-orange-600 dark:text-orange-400">{stats.insufficient}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Icon name="AlertCircle" size={24} className="text-orange-600 dark:text-orange-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Средняя полнота</p>
              <p className="text-2xl font-bold mt-1">{stats.avgCompleteness}%</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Icon name="BarChart3" size={24} className="text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
