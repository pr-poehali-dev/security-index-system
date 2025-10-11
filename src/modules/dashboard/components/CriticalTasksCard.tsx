import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ReportPeriodSelector from '@/components/dashboard/ReportPeriodSelector';
import { getPriorityColor, getPriorityLabel } from './RecentActivityCard';
import type { ReportPeriod } from '@/utils/reportGenerator';
import type { Task } from '@/types';

interface CriticalTasksCardProps {
  tasks: Task[];
  onGenerateReport: (period: ReportPeriod) => Promise<void>;
  onViewAll: () => void;
}

export default function CriticalTasksCard({ tasks, onGenerateReport, onViewAll }: CriticalTasksCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="AlertTriangle" size={20} className="text-red-600" />
            Критические задачи
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
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="CheckCircle2" size={48} className="mx-auto mb-2 opacity-50 text-emerald-600" />
            <p className="text-sm">Нет критических задач</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
              
              return (
                <div 
                  key={task.id} 
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={onViewAll}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{task.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{task.assignee || 'Не назначено'}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </div>
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-xs">
                      <Icon name="Calendar" size={12} className={isOverdue ? 'text-red-600' : 'text-gray-500'} />
                      <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                        {isOverdue ? 'Просрочено: ' : 'Срок: '}
                        {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
