import { useState } from 'react';
import { useIncidentStore } from '@/stores/incidentStore';
import { useCatalogStore } from '@/stores/catalogStore';
import { useAuthStore } from '@/stores/authStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import type { Incident, IncidentStatus } from '@/types/incidents';

interface IncidentDetailsDialogProps {
  incident: Incident;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IncidentDetailsDialog({ incident, open, onOpenChange }: IncidentDetailsDialogProps) {
  const { updateIncident, incidentTypes } = useIncidentStore();
  const { objects } = useCatalogStore();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');
  const [resolution, setResolution] = useState(incident.resolution || '');

  const incidentType = incidentTypes.find(t => t.id === incident.typeId);
  const object = objects.find(o => o.id === incident.objectId);

  const canEdit = user && (user.role === 'SuperAdmin' || user.role === 'TenantAdmin' || user.role === 'Auditor');
  const canClose = user && (user.role === 'SuperAdmin' || user.role === 'TenantAdmin' || user.role === 'Auditor');

  const handleStatusChange = (newStatus: IncidentStatus) => {
    if (newStatus === 'closed' && !resolution) {
      alert('Для закрытия инцидента необходимо указать решение');
      return;
    }

    updateIncident(incident.id, {
      status: newStatus,
      ...(newStatus === 'closed' && { closedAt: new Date().toISOString(), resolution })
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;

    const comment = {
      id: `comment-${Date.now()}`,
      incidentId: incident.id,
      userId: user.id,
      userName: user.name,
      text: newComment,
      createdAt: new Date().toISOString()
    };

    updateIncident(incident.id, {
      comments: [...(incident.comments || []), comment]
    });

    setNewComment('');
  };

  const handleSaveResolution = () => {
    updateIncident(incident.id, { resolution });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'under_review': return 'bg-yellow-100 text-yellow-700';
      case 'closed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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

  const statusOptions: { value: IncidentStatus; label: string; disabled?: boolean }[] = [
    { value: 'new', label: 'Новый' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'under_review', label: 'На проверке' },
    { value: 'closed', label: 'Закрыт', disabled: !canClose }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{incident.title}</DialogTitle>
              <DialogDescription>ID: {incident.id}</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(incident.priority)}>
                {incident.priority === 'critical' ? 'Критический' : 
                 incident.priority === 'high' ? 'Высокий' : 
                 incident.priority === 'medium' ? 'Средний' : 'Низкий'}
              </Badge>
              <Badge className={getStatusColor(incident.status)}>
                {incident.status === 'new' ? 'Новый' :
                 incident.status === 'in_progress' ? 'В работе' :
                 incident.status === 'under_review' ? 'На проверке' : 'Закрыт'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="details" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Info" size={20} />
              <span className="text-xs font-medium">Основное</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Clock" size={20} />
              <span className="text-xs font-medium">Хронология</span>
            </TabsTrigger>
            <TabsTrigger value="resolution" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="CheckCircle2" size={20} />
              <span className="text-xs font-medium">Решение</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="MessageSquare" size={20} />
              <span className="text-xs font-medium">Комментарии ({incident.comments?.length || 0})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select 
                  value={incident.status} 
                  onValueChange={(value) => handleStatusChange(value as IncidentStatus)}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Тип инцидента</Label>
                <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm">{incidentType?.name || 'Неизвестно'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <p className="text-sm text-gray-700 dark:text-gray-300 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {incident.description}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="Building" size={16} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Объект</p>
                    <p className="text-sm font-medium">{object?.name || 'Не указан'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="User" size={16} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Ответственный</p>
                    <p className="text-sm font-medium">{incident.assignedToName || 'Не назначен'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={16} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Создан</p>
                    <p className="text-sm font-medium">{new Date(incident.createdAt).toLocaleString('ru-RU')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={16} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Срок устранения</p>
                    <p className="text-sm font-medium">
                      {incident.dueDate ? new Date(incident.dueDate).toLocaleDateString('ru-RU') : 'Не указан'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {incident.source !== 'manual' && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Icon name="Info" className="text-blue-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      {incident.source === 'checklist' ? 'Создан автоматически из чек-листа' : 'Создан автоматически'}
                    </p>
                    {incident.checklistInspectionId && (
                      <p className="text-xs text-blue-800 dark:text-blue-300">
                        ID проверки: {incident.checklistInspectionId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Icon name="Plus" size={16} className="text-blue-600" />
                  </div>
                  <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />
                </div>
                <div className="flex-1 pb-6">
                  <p className="font-medium text-sm">Инцидент создан</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{incident.createdByName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(incident.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>

              {incident.status !== 'new' && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <Icon name="PlayCircle" size={16} className="text-purple-600" />
                    </div>
                    {incident.status !== 'in_progress' && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-medium text-sm">Взят в работу</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{incident.assignedToName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(incident.updatedAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              )}

              {(incident.status === 'under_review' || incident.status === 'closed') && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                      <Icon name="Eye" size={16} className="text-yellow-600" />
                    </div>
                    {incident.status !== 'under_review' && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-medium text-sm">Отправлен на проверку</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(incident.updatedAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              )}

              {incident.status === 'closed' && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                    <Icon name="CheckCircle2" size={16} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Инцидент закрыт</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {incident.closedAt ? new Date(incident.closedAt).toLocaleString('ru-RU') : 'Недавно'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resolution" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Решение по инциденту</Label>
                <Textarea
                  rows={8}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Опишите принятые меры и решение..."
                  disabled={!canEdit || incident.status === 'closed'}
                />
              </div>
              
              {canEdit && incident.status !== 'closed' && (
                <Button onClick={handleSaveResolution} disabled={!resolution}>
                  <Icon name="Save" className="mr-2" size={16} />
                  Сохранить решение
                </Button>
              )}

              {incident.status === 'closed' && incident.closedAt && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle2" className="text-emerald-600" size={16} />
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                      Инцидент закрыт {new Date(incident.closedAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-6">
            <div className="space-y-4">
              {incident.comments && incident.comments.length > 0 ? (
                incident.comments.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{comment.userName}</p>
                        <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString('ru-RU')}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
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