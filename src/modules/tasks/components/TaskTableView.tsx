import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { Task } from '@/types/tasks';

interface TaskTableViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-700 border-green-200';
  }
};

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-700';
    case 'in_progress': return 'bg-purple-100 text-purple-700';
    case 'completed': return 'bg-green-100 text-green-700';
    case 'cancelled': return 'bg-gray-100 text-gray-700';
  }
};

const getPriorityLabel = (priority: Task['priority']) => {
  switch (priority) {
    case 'critical': return 'Критический';
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
  }
};

const getStatusLabel = (status: Task['status']) => {
  switch (status) {
    case 'open': return 'Открыта';
    case 'in_progress': return 'В работе';
    case 'completed': return 'Завершена';
    case 'cancelled': return 'Отменена';
  }
};

export default function TaskTableView({ tasks, onTaskClick }: TaskTableViewProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: string, status: Task['status']) => {
    if (status === 'completed' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left p-3 font-semibold text-sm">Название</th>
              <th className="text-left p-3 font-semibold text-sm">Приоритет</th>
              <th className="text-left p-3 font-semibold text-sm">Статус</th>
              <th className="text-left p-3 font-semibold text-sm">Ответственный</th>
              <th className="text-left p-3 font-semibold text-sm">Срок</th>
              <th className="text-left p-3 font-semibold text-sm">Объект</th>
              <th className="text-right p-3 font-semibold text-sm">Действия</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const overdueTask = isOverdue(task.dueDate, task.status);
              
              return (
                <tr 
                  key={task.id}
                  className="border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <td className="p-3">
                    <div className="flex items-start gap-2">
                      <Icon name="ListTodo" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge className={getPriorityColor(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <p className="text-sm">{task.assignee}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      {overdueTask && (
                        <Icon name="AlertCircle" size={14} className="text-red-500" />
                      )}
                      <span className={`text-sm ${overdueTask ? 'text-red-600 font-semibold' : ''}`}>
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="text-sm text-muted-foreground">{task.object || '-'}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}
                        title="Просмотр"
                      >
                        <Icon name="Eye" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {tasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="Search" className="mx-auto mb-3" size={48} />
          <p>Задачи не найдены</p>
        </div>
      )}
    </div>
  );
}
