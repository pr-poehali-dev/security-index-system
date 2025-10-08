import { useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import type { Task, TaskStatus } from '@/types/tasks';

interface TaskDetailsDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskDetailsDialog({ task, open, onOpenChange }: TaskDetailsDialogProps) {
  const { updateTask } = useTaskStore();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');
  const [workDescription, setWorkDescription] = useState('');

  const isAssignee = user?.id === task.assignedTo;
  const isCreator = user?.id === task.createdBy;
  const canEdit = user && (user.role === 'SuperAdmin' || user.role === 'TenantAdmin' || user.role === 'Auditor' || isCreator);
  const canChangeStatus = isAssignee || canEdit;

  const handleStatusChange = (newStatus: TaskStatus) => {
    const updates: Partial<Task> = { status: newStatus };

    if (newStatus === 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    if (newStatus === 'in_progress' && task.status === 'new') {
      // Автоматически добавляем событие в timeline
      const timelineEvent = {
        id: `event-${Date.now()}`,
        taskId: task.id,
        eventType: 'status_changed' as const,
        description: `Статус изменен на "В работе"`,
        userId: user!.id,
        userName: user!.name,
        createdAt: new Date().toISOString()
      };
      updates.timeline = [...(task.timeline || []), timelineEvent];
    }

    updateTask(task.id, updates);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;

    const comment = {
      id: `comment-${Date.now()}`,
      taskId: task.id,
      userId: user.id,
      userName: user.name,
      text: newComment,
      createdAt: new Date().toISOString()
    };

    const timelineEvent = {
      id: `event-${Date.now()}`,
      taskId: task.id,
      eventType: 'commented' as const,
      description: `Добавлен комментарий`,
      userId: user.id,
      userName: user.name,
      createdAt: new Date().toISOString()
    };

    updateTask(task.id, {
      comments: [...(task.comments || []), comment],
      timeline: [...(task.timeline || []), timelineEvent]
    });

    setNewComment('');
  };

  const handleCompleteTask = () => {
    if (!workDescription.trim()) {
      alert('Опишите выполненную работу');
      return;
    }

    const comment = {
      id: `comment-${Date.now()}`,
      taskId: task.id,
      userId: user!.id,
      userName: user!.name,
      text: `Задача выполнена.\n\nОписание работ: ${workDescription}`,
      createdAt: new Date().toISOString()
    };

    const timelineEvent = {
      id: `event-${Date.now()}`,
      taskId: task.id,
      eventType: 'completed' as const,
      description: 'Задача завершена',
      userId: user!.id,
      userName: user!.name,
      createdAt: new Date().toISOString()
    };

    updateTask(task.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      comments: [...(task.comments || []), comment],
      timeline: [...(task.timeline || []), timelineEvent]
    });

    setWorkDescription('');
  };

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

  const statusFlow: TaskStatus[] = ['new', 'assigned', 'in_progress', 'under_review', 'completed'];
  const currentStatusIndex = statusFlow.indexOf(task.status);
  
  const availableStatuses = statusFlow.filter((_, index) => {
    if (!canChangeStatus) return false;
    // Можно перейти на следующий статус или вернуться на предыдущий
    return Math.abs(index - currentStatusIndex) <= 1 && index !== currentStatusIndex;
  });

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
              <DialogDescription>ID: {task.id}</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {getStatusLabel(task.status)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {isOverdue && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <Icon name="AlertCircle" className="text-red-600" size={16} />
              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                Задача просрочена! Срок истек {new Date(task.dueDate).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="details" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Info" size={20} />
              <span className="text-xs font-medium">Основное</span>
            </TabsTrigger>
            <TabsTrigger value="work" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Wrench" size={20} />
              <span className="text-xs font-medium">Выполнение</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Clock" size={20} />
              <span className="text-xs font-medium">Хронология</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="MessageSquare" size={20} />
              <span className="text-xs font-medium">Комментарии ({task.comments?.length || 0})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select 
                  value={task.status} 
                  onValueChange={(value) => handleStatusChange(value as TaskStatus)}
                  disabled={!canChangeStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={task.status}>{getStatusLabel(task.status)}</SelectItem>
                    {availableStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Приоритет</Label>
                <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm">{getPriorityLabel(task.priority)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <p className="text-sm text-gray-700 dark:text-gray-300 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {task.description}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="User" size={16} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Создал</p>
                    <p className="text-sm font-medium">{task.createdByName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="UserCheck" size={16} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Исполнитель</p>
                    <p className="text-sm font-medium">{task.assignedToName || 'Не назначен'}</p>
                  </div>
                </div>
                {task.objectName && (
                  <div className="flex items-center gap-2">
                    <Icon name="Building" size={16} className="text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Объект</p>
                      <p className="text-sm font-medium">{task.objectName}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={16} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Создана</p>
                    <p className="text-sm font-medium">{new Date(task.createdAt).toLocaleString('ru-RU')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={16} className={isOverdue ? 'text-red-500' : 'text-gray-500'} />
                  <div>
                    <p className="text-xs text-gray-500">Срок выполнения</p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                {task.completedAt && (
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle2" size={16} className="text-emerald-500" />
                    <div>
                      <p className="text-xs text-gray-500">Завершена</p>
                      <p className="text-sm font-medium text-emerald-600">
                        {new Date(task.completedAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {task.source !== 'manual' && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Icon name="Info" className="text-blue-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      {task.source === 'incident' ? 'Создана из инцидента' :
                       task.source === 'checklist' ? 'Создана из чек-листа' :
                       task.source === 'certification' ? 'Создана из аттестации' : 'Создана автоматически'}
                    </p>
                    {task.sourceId && (
                      <p className="text-xs text-blue-800 dark:text-blue-300">
                        ID источника: {task.sourceId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="work" className="space-y-4 mt-6">
            {task.status === 'completed' ? (
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="CheckCircle2" className="text-emerald-600" size={20} />
                  <p className="font-medium text-emerald-900 dark:text-emerald-200">Задача выполнена</p>
                </div>
                <p className="text-sm text-emerald-800 dark:text-emerald-300">
                  Завершена {task.completedAt ? new Date(task.completedAt).toLocaleDateString('ru-RU') : 'недавно'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Описание выполненной работы</Label>
                  <Textarea
                    rows={6}
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    placeholder="Опишите, что было сделано для выполнения задачи..."
                    disabled={!isAssignee || task.status === 'completed'}
                  />
                </div>

                {isAssignee && task.status !== 'completed' && (
                  <div className="flex gap-2">
                    {task.status === 'new' && (
                      <Button onClick={() => handleStatusChange('in_progress')} variant="outline">
                        <Icon name="Play" className="mr-2" size={16} />
                        Взять в работу
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button onClick={handleCompleteTask} disabled={!workDescription.trim()}>
                        <Icon name="CheckCircle2" className="mr-2" size={16} />
                        Завершить задачу
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <Label>Вложения</Label>
              {task.attachments && task.attachments.length > 0 ? (
                <div className="space-y-2">
                  {task.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Icon name="FileText" size={20} className="text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{attachment.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {attachment.uploadedByName} • {new Date(attachment.uploadedAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Icon name="Download" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Вложений нет</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4 mt-6">
            <div className="space-y-4">
              {task.timeline && task.timeline.length > 0 ? (
                task.timeline.map((event, index) => {
                  const isLast = index === task.timeline!.length - 1;
                  const iconName = 
                    event.eventType === 'created' ? 'Plus' :
                    event.eventType === 'assigned' ? 'UserPlus' :
                    event.eventType === 'status_changed' ? 'RefreshCw' :
                    event.eventType === 'commented' ? 'MessageSquare' :
                    event.eventType === 'completed' ? 'CheckCircle2' : 'Circle';

                  return (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <Icon name={iconName} size={16} className="text-blue-600" />
                        </div>
                        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />}
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="font-medium text-sm">{event.description}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{event.userName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">История событий пуста</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-6">
            <div className="space-y-4">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{comment.userName}</p>
                        <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString('ru-RU')}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">Комментариев пока нет</p>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>Добавить комментарий</Label>
                <Textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Введите комментарий..."
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Icon name="MessageSquare" className="mr-2" size={16} />
                  Добавить комментарий
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}