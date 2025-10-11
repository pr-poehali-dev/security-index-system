import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AnalyticsStats {
  total: number;
  completed: number;
  overdue: number;
  inProgress: number;
  awaiting: number;
  created: number;
  completionRate: number;
  overdueRate: number;
  last30Days: number;
  urgentIncidents: number;
  onTimeCompleted: number;
  lateCompleted: number;
  onTimeRate: number;
  avgDaysToComplete: number;
}

interface AnalyticsStatsGridProps {
  stats: AnalyticsStats;
}

export default function AnalyticsStatsGrid({ stats }: AnalyticsStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего инцидентов</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">
                +{stats.last30Days} за 30 дней
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="FileText" size={24} className="text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Процент исполнения</p>
              <p className="text-3xl font-bold mt-1 text-green-600">{stats.completionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completed} из {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Исполнено в срок</p>
              <p className="text-3xl font-bold mt-1 text-blue-600">{stats.onTimeRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.onTimeCompleted} вовремя
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Требует внимания</p>
              <p className="text-3xl font-bold mt-1 text-orange-600">{stats.urgentIncidents}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Срочные инциденты
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Icon name="AlertTriangle" size={24} className="text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Просрочено</p>
              <p className="text-3xl font-bold mt-1 text-red-600">{stats.overdue}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.overdueRate}% от общего
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="AlertCircle" size={24} className="text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">В работе</p>
              <p className="text-3xl font-bold mt-1 text-blue-600">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Активные задачи
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name="Activity" size={24} className="text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ожидает исполнения</p>
              <p className="text-3xl font-bold mt-1 text-orange-600">{stats.awaiting}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Запланировано
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Средний срок</p>
              <p className="text-3xl font-bold mt-1 text-purple-600">{stats.avgDaysToComplete}</p>
              <p className="text-xs text-muted-foreground mt-1">
                дней на инцидент
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Icon name="Calendar" size={24} className="text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
