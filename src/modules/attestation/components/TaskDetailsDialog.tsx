import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getTaskTypeLabel,
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

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

export default function TaskDetailsDialog({ task, open, onClose }: TaskDetailsDialogProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Детали задачи</DialogTitle>
          <DialogDescription>
            {getTaskTypeLabel(task.type)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Приоритет</p>
              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Статус</p>
              <Badge variant={getStatusColor(task.status) as any}>
                {getStatusLabel(task.status)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <h4 className="font-medium">Сотрудник</h4>
            <p className="text-base">{task.employeeName}</p>
            <p className="text-sm text-muted-foreground">{task.employeePosition}</p>
            <p className="text-sm text-muted-foreground">{task.department}</p>
          </div>

          <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <h4 className="font-medium">Аттестация</h4>
            <p className="text-sm"><strong>Категория:</strong> {task.category}</p>
            <p className="text-sm"><strong>Область:</strong> {task.area}</p>
            <p className="text-sm">
              <strong>Срок действия:</strong> {new Date(task.expiryDate).toLocaleDateString('ru-RU')}
            </p>
            <p className={`text-sm font-medium ${
              task.daysLeft < 0 ? 'text-red-600' :
              task.daysLeft <= 30 ? 'text-orange-600' :
              task.daysLeft <= 60 ? 'text-amber-600' :
              'text-blue-600'
            }`}>
              {task.daysLeft > 0 
                ? `Осталось ${task.daysLeft} дней` 
                : `Просрочено на ${Math.abs(task.daysLeft)} дней`
              }
            </p>
          </div>

          <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <h4 className="font-medium">Информация о задаче</h4>
            <p className="text-sm">
              <strong>Создана:</strong> {new Date(task.createdAt).toLocaleDateString('ru-RU')}
            </p>
            {task.completedAt && (
              <p className="text-sm">
                <strong>Завершена:</strong> {new Date(task.completedAt).toLocaleDateString('ru-RU')}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
