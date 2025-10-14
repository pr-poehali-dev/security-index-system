import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import {
  getTaskTypeLabel,
  getTaskTypeIcon,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
} from '../utils/taskUtils';

interface Task {
  id: string;
  type: 'reminder_90' | 'reminder_60' | 'reminder_30' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'critical';
  employeeName: string;
  employeeId: string;
  employeePosition: string;
  department: string;
  category: string;
  area: string;
  expiryDate: string;
  daysLeft: number;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  completedAt?: string;
}

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusChange: (newStatus: 'pending' | 'in_progress' | 'completed') => void;
  onViewDetails: () => void;
}

export default function TaskCard({
  task,
  isSelected,
  onSelect,
  onStatusChange,
  onViewDetails
}: TaskCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${
        task.status === 'completed' ? 'opacity-60' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Icon
                  name={getTaskTypeIcon(task.type)}
                  size={18}
                  className={
                    task.priority === 'critical' ? 'text-red-600' :
                    task.priority === 'high' ? 'text-orange-600' :
                    task.priority === 'medium' ? 'text-amber-600' :
                    'text-blue-600'
                  }
                />
                <span className="font-medium">{getTaskTypeLabel(task.type)}</span>
                <Badge className={getPriorityColor(task.priority)}>
                  {getPriorityLabel(task.priority)}
                </Badge>
                <Badge variant={getStatusColor(task.status) as any}>
                  {getStatusLabel(task.status)}
                </Badge>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              <p className="font-medium text-base">{task.employeeName}</p>
              <p className="text-sm text-muted-foreground">
                {task.employeePosition} • {task.department}
              </p>
              <p className="text-sm">{task.area}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon name="Tag" size={12} />
                  {task.category}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Calendar" size={12} />
                  Срок: {new Date(task.expiryDate).toLocaleDateString('ru-RU')}
                </span>
                <span className={`flex items-center gap-1 font-medium ${
                  task.daysLeft < 0 ? 'text-red-600' :
                  task.daysLeft <= 30 ? 'text-orange-600' :
                  task.daysLeft <= 60 ? 'text-amber-600' :
                  'text-blue-600'
                }`}>
                  <Icon name="Clock" size={12} />
                  {task.daysLeft > 0 ? `Осталось ${task.daysLeft} дн.` : `Просрочено на ${Math.abs(task.daysLeft)} дн.`}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {task.status === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange('in_progress');
                  }}
                  className="gap-2"
                >
                  <Icon name="PlayCircle" size={14} />
                  Взять в работу
                </Button>
              )}
              {task.status === 'in_progress' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange('completed');
                  }}
                  className="gap-2"
                >
                  <Icon name="CheckCircle2" size={14} />
                  Завершить
                </Button>
              )}
              {task.status === 'completed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange('pending');
                  }}
                  className="gap-2"
                >
                  <Icon name="RotateCcw" size={14} />
                  Вернуть в работу
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/attestation?employee=${task.employeeId}`;
                }}
                className="gap-2"
              >
                <Icon name="User" size={14} />
                Карточка сотрудника
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                }}
                className="gap-2"
              >
                <Icon name="Eye" size={14} />
                Подробнее
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}