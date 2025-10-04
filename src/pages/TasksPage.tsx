import { useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import PageHeader from '@/components/layout/PageHeader';
import TaskDetailsDialog from '@/components/tasks/TaskDetailsDialog';
import { Card, CardContent } from '@/components/ui/card';
import type { Task } from '@/types/tasks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

export default function TasksPage() {
  const { tasks, getTasksByAssignee } = useTaskStore();
  const user = useAuthStore((state) => state.user);
  const [selectedView, setSelectedView] = useState<'my' | 'all'>('my');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const myTasks = user ? getTasksByAssignee(user.id) : [];
  const displayTasks = selectedView === 'my' ? myTasks : tasks;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      assigned: 'bg-purple-100 text-purple-700',
      in_progress: 'bg-amber-100 text-amber-700',
      under_review: 'bg-cyan-100 text-cyan-700',
      completed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: 'Новая',
      assigned: 'Назначена',
      in_progress: 'В работе',
      under_review: 'На проверке',
      completed: 'Завершена',
      cancelled: 'Отменена'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      critical: 'Критический',
      high: 'Высокий',
      medium: 'Средний',
      low: 'Низкий'
    };
    return labels[priority] || priority;
  };

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length
  };

  return (
    <div>
      <PageHeader
        title="Управление задачами"
        description="Постановка и контроль выполнения задач"
        icon="ListTodo"
        action={
          <Button className="gap-2">
            <Icon name="Plus" size={18} />
            Создать задачу
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="ListTodo" className="text-gray-600" size={24} />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Всего задач</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Clock" className="text-amber-600" size={24} />
              <span className="text-2xl font-bold">{stats.inProgress}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">В работе</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Завершено</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="AlertTriangle" className="text-red-600" size={24} />
              <span className="text-2xl font-bold">{stats.overdue}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Просрочено</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as 'my' | 'all')}>
        <TabsList>
          <TabsTrigger value="my">Мои задачи ({myTasks.length})</TabsTrigger>
          <TabsTrigger value="all">Все задачи ({tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedView} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayTasks.map((task) => {
              const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
              
              return (
                <Card key={task.id} className={`hover-scale ${isOverdue ? 'border-red-300' : ''}`}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{task.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{task.description}</p>
                        </div>
                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusLabel(task.status)}
                        </Badge>
                        {task.source !== 'manual' && (
                          <Badge variant="outline" className="text-xs">
                            {task.source === 'incident' ? 'Из инцидента' : 'Автоматическая'}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Icon name="User" size={14} className="text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {task.assignedToName || 'Не назначена'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Calendar" size={14} className={isOverdue ? 'text-red-500' : 'text-gray-500'} />
                          <span className={isOverdue ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}>
                            {isOverdue && <Icon name="AlertCircle" size={12} className="inline mr-1" />}
                            Срок: {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        {task.objectName && (
                          <div className="flex items-center gap-2">
                            <Icon name="Building" size={14} className="text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300">{task.objectName}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedTask(task)}>
                          <Icon name="Eye" className="mr-1" size={14} />
                          Просмотр
                        </Button>
                        {task.status === 'in_progress' && (
                          <Button size="sm" variant="default" onClick={() => setSelectedTask(task)}>
                            <Icon name="Check" size={14} className="mr-1" />
                            Завершить
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {selectedTask && (
        <TaskDetailsDialog
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        />
      )}
    </div>
  );
}