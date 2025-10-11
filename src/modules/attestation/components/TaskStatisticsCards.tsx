import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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

interface TaskStatisticsCardsProps {
  statistics: TaskStatistics;
}

export default function TaskStatisticsCards({ statistics }: TaskStatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="ListTodo" className="text-blue-600" size={24} />
            <span className="text-2xl font-bold">{statistics.total}</span>
          </div>
          <p className="text-sm text-muted-foreground">Всего задач</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Clock" className="text-amber-600" size={24} />
            <span className="text-2xl font-bold">{statistics.pending}</span>
          </div>
          <p className="text-sm text-muted-foreground">Ожидают выполнения</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="PlayCircle" className="text-purple-600" size={24} />
            <span className="text-2xl font-bold">{statistics.inProgress}</span>
          </div>
          <p className="text-sm text-muted-foreground">В работе</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
            <span className="text-2xl font-bold">{statistics.completed}</span>
          </div>
          <p className="text-sm text-muted-foreground">Выполнено</p>
        </CardContent>
      </Card>
    </div>
  );
}
