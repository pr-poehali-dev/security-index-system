import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ReportPeriodSelector from '@/components/dashboard/ReportPeriodSelector';
import type { ReportPeriod } from '@/utils/reportGenerator';

interface ExpertiseItem {
  id: string;
  name: string;
  organization: string;
  date: string;
  daysLeft: number;
  type: string;
}

interface UpcomingExpertiseCardProps {
  items: ExpertiseItem[];
  onGenerateReport: (period: ReportPeriod) => Promise<void>;
  onViewAll: () => void;
}

export default function UpcomingExpertiseCard({ items, onGenerateReport, onViewAll }: UpcomingExpertiseCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={20} className="text-amber-600" />
            Экспертизы промышленной безопасности
          </CardTitle>
          <div className="flex gap-2">
            <ReportPeriodSelector 
              onGenerateReport={onGenerateReport}
              variant="ghost"
              size="sm"
              showLabel={false}
            />
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              Все объекты
              <Icon name="ArrowRight" size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="CheckCircle2" size={48} className="mx-auto mb-2 opacity-50 text-emerald-600" />
            <p className="text-sm">Нет предстоящих экспертиз</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isOverdue = item.daysLeft < 0;
              const isCritical = item.daysLeft <= 30 && item.daysLeft >= 0;
              
              return (
                <div 
                  key={item.id} 
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={onViewAll}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.organization}</p>
                    </div>
                    <Badge 
                      variant={isOverdue ? 'destructive' : isCritical ? 'default' : 'secondary'} 
                      className="text-xs ml-2"
                    >
                      {isOverdue 
                        ? `Просрочено ${Math.abs(item.daysLeft)} дн.`
                        : `${item.daysLeft} дн.`
                      }
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>До экспертизы</span>
                      <span>{new Date(item.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <Progress 
                      value={isOverdue ? 100 : Math.min(((90 - item.daysLeft) / 90) * 100, 100)} 
                      className="h-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
