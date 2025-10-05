import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { SortableTableHeader, type SortDirection } from '@/components/ui/sortable-table-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToExcel, type ExportColumn } from '@/utils/export';
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
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: SortDirection }>({ 
    field: 'dueDate', 
    direction: 'asc' 
  });

  const handleSort = (field: string) => {
    setSortConfig(prev => {
      if (prev.field !== field) {
        return { field, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      if (prev.direction === 'desc') {
        return { field, direction: null };
      }
      return { field, direction: 'asc' };
    });
  };

  const sortedTasks = useMemo(() => {
    if (!sortConfig.direction) return tasks;

    return [...tasks].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          const statusOrder = { open: 1, in_progress: 2, completed: 3, cancelled: 4 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        case 'assignee':
          aValue = a.assignedTo.toLowerCase();
          bValue = b.assignedTo.toLowerCase();
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        case 'object':
          aValue = (a.object || '').toLowerCase();
          bValue = (b.object || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tasks, sortConfig]);

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

  const handleExport = (format: 'csv' | 'excel') => {
    const columns: ExportColumn<Task>[] = [
      { key: 'title', label: 'Название' },
      { key: 'description', label: 'Описание' },
      { 
        key: 'priority', 
        label: 'Приоритет',
        format: (value) => getPriorityLabel(value)
      },
      { 
        key: 'status', 
        label: 'Статус',
        format: (value) => getStatusLabel(value)
      },
      { key: 'assignee', label: 'Ответственный' },
      { 
        key: 'dueDate', 
        label: 'Срок',
        format: (value) => formatDate(value)
      },
      { key: 'object', label: 'Объект' }
    ];

    const filename = `Задачи_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}`;

    if (format === 'csv') {
      exportToCSV(sortedTasks, columns, filename);
    } else {
      exportToExcel(sortedTasks, columns, filename, 'Задачи');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <Icon name="FileText" size={16} className="mr-2" />
              Экспорт в CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              <Icon name="FileSpreadsheet" size={16} className="mr-2" />
              Экспорт в Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <SortableTableHeader
                label="Название"
                field="title"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Приоритет"
                field="priority"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Статус"
                field="status"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Ответственный"
                field="assignee"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Срок"
                field="dueDate"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Объект"
                field="object"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <th className="text-right p-3 font-semibold text-sm">Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task) => {
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
      
      
      {sortedTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="Search" className="mx-auto mb-3" size={48} />
          <p>Задачи не найдены</p>
        </div>
      )}
      </div>
    </div>
  );
}