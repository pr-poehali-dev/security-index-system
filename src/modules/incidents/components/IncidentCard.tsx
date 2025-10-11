import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { Incident } from '@/types';

interface IncidentCardProps {
  incident: Incident;
  incidentTypeName?: string;
  objectName?: string;
  onViewDetails: (incident: Incident) => void;
}

const getDaysLeftColor = (daysLeft: number) => {
  if (daysLeft < 0) return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  if (daysLeft <= 3) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
  if (daysLeft <= 7) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
  return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'created': return 'bg-blue-100 text-blue-700';
    case 'in_progress': return 'bg-purple-100 text-purple-700';
    case 'awaiting': return 'bg-yellow-100 text-yellow-700';
    case 'overdue': return 'bg-red-100 text-red-700';
    case 'completed': return 'bg-emerald-100 text-emerald-700';
    case 'completed_late': return 'bg-orange-100 text-orange-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    created: 'Создано',
    in_progress: 'В работе',
    awaiting: 'Ожидает',
    overdue: 'Просрочено',
    completed: 'Исполнено',
    completed_late: 'Исполнено с опозданием'
  };
  return labels[status] || status;
};

const getDaysLeftLabel = (daysLeft: number) => {
  if (daysLeft < 0) return `Просрочено на ${Math.abs(daysLeft)} дн.`;
  if (daysLeft === 0) return 'Сегодня';
  return `Осталось ${daysLeft} дн.`;
};

export default function IncidentCard({ 
  incident, 
  incidentTypeName, 
  objectName, 
  onViewDetails 
}: IncidentCardProps) {
  return (
    <Card className="hover-scale">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {incident.description.length > 60 ? incident.description.slice(0, 60) + '...' : incident.description}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {incident.correctiveAction}
              </p>
            </div>
            <Badge className={getDaysLeftColor(incident.daysLeft)}>
              {getDaysLeftLabel(incident.daysLeft)}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(incident.status)}>
              {getStatusLabel(incident.status)}
            </Badge>
            {incidentTypeName && (
              <Badge variant="outline">{incidentTypeName}</Badge>
            )}
          </div>

          <div className="space-y-2 text-sm">
            {objectName && (
              <div className="flex items-center gap-2">
                <Icon name="Building" size={14} className="text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{objectName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Icon name="User" size={14} className="text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {incident.responsiblePersonnelId || 'Не назначен'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={14} className="text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                До: {new Date(incident.plannedDate).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1" 
              onClick={() => onViewDetails(incident)}
            >
              <Icon name="Eye" className="mr-1" size={14} />
              Просмотр
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(incident)}
            >
              <Icon name="MessageSquare" size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}