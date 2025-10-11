import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ReportPeriodSelector from '@/components/dashboard/ReportPeriodSelector';
import type { ReportPeriod } from '@/utils/reportGenerator';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    case 'open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed': return 'Завершено';
    case 'in_progress': return 'В работе';
    case 'pending': return 'Ожидает';
    case 'open': return 'Открыто';
    case 'resolved': return 'Решено';
    case 'closed': return 'Закрыто';
    default: return status;
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
    case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
};

export const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'critical': return 'Критический';
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
    default: return priority;
  }
};

interface Activity {
  id: string;
  type: 'task' | 'incident' | 'object';
  title: string;
  subtitle: string;
  time: string;
  status: string;
  priority?: string;
  onClick: () => void;
}

interface RecentActivityCardProps {
  activities: Activity[];
  onGenerateReport: (period: ReportPeriod) => Promise<void>;
  onViewAll: () => void;
}

export default function RecentActivityCard({ activities, onGenerateReport, onViewAll }: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Activity" size={20} className="text-emerald-600" />
            Последняя активность
          </CardTitle>
          <div className="flex gap-2">
            <ReportPeriodSelector 
              onGenerateReport={onGenerateReport}
              variant="ghost"
              size="sm"
              showLabel={false}
            />
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              Все задачи
              <Icon name="ArrowRight" size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Inbox" size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Нет активности</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={activity.onClick}
              >
                <div className="mt-1">
                  <Icon 
                    name={
                      activity.type === 'task' ? 'ListTodo' :
                      activity.type === 'incident' ? 'AlertCircle' : 'Building'
                    } 
                    size={18}
                    className={
                      activity.type === 'task' ? 'text-emerald-600' :
                      activity.type === 'incident' ? 'text-red-600' : 'text-blue-600'
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{activity.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{activity.subtitle} • {activity.time}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge className={getStatusColor(activity.status)} variant="secondary">
                    {getStatusLabel(activity.status)}
                  </Badge>
                  {activity.priority && (
                    <Badge className={getPriorityColor(activity.priority)} variant="outline">
                      {getPriorityLabel(activity.priority)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
