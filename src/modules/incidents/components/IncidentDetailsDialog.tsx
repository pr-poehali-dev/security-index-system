import { useState } from 'react';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
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
import type { Incident, IncidentStatus } from '@/types';

interface IncidentDetailsDialogProps {
  incident: Incident;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IncidentDetailsDialog({ incident, open, onOpenChange }: IncidentDetailsDialogProps) {
  const { updateIncident } = useIncidentsStore();
  const { getFacilitiesByTenant } = useFacilitiesStore();
  const user = useAuthStore((state) => state.user);
  const objects = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');
  const [resolution, setResolution] = useState(incident.notes || '');

  const object = objects.find(o => o.id === incident.organizationId);

  const canEdit = user && (user.role === 'SuperAdmin' || user.role === 'TenantAdmin' || user.role === 'Auditor');
  const canClose = user && (user.role === 'SuperAdmin' || user.role === 'TenantAdmin' || user.role === 'Auditor');

  const handleStatusChange = (newStatus: IncidentStatus) => {
    if ((newStatus === 'completed' || newStatus === 'completed_late') && !resolution) {
      alert('Для закрытия инцидента необходимо указать решение');
      return;
    }

    updateIncident(incident.id, {
      status: newStatus,
      ...((newStatus === 'completed' || newStatus === 'completed_late') && { completedDate: new Date().toISOString(), notes: resolution })
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;

    const currentNotes = incident.notes || '';
    const timestamp = new Date().toLocaleString('ru-RU');
    const newNoteEntry = `[${timestamp}] ${user.name}: ${newComment}`;
    const updatedNotes = currentNotes ? `${currentNotes}\n\n${newNoteEntry}` : newNoteEntry;

    updateIncident(incident.id, {
      notes: updatedNotes
    });

    setNewComment('');
  };

  const handleSaveResolution = () => {
    updateIncident(incident.id, { notes: resolution });
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

  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft < 0) return 'bg-red-100 text-red-700';
    if (daysLeft <= 3) return 'bg-orange-100 text-orange-700';
    if (daysLeft <= 7) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const statusOptions: { value: IncidentStatus; label: string; disabled?: boolean }[] = [
    { value: 'created', label: 'Создано' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'awaiting', label: 'Ожидает' },
    { value: 'overdue', label: 'Просрочено' },
    { value: 'completed', label: 'Исполнено', disabled: !canClose },
    { value: 'completed_late', label: 'Исполнено с опозданием', disabled: !canClose }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{incident.description.length > 80 ? incident.description.slice(0, 80) + '...' : incident.description}</DialogTitle>
              <DialogDescription>ID: {incident.id}</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getDaysLeftColor(incident.daysLeft)}>
                {incident.daysLeft < 0 ? `Просрочено на ${Math.abs(incident.daysLeft)} дн.` : 
                 incident.daysLeft === 0 ? 'Сегодня' :
                 `Осталось ${incident.daysLeft} дн.`}
              </Badge>
              <Badge className={getStatusColor(incident.status)}>
                {incident.status === 'created' ? 'Создано' :
                 incident.status === 'in_progress' ? 'В работе' :
                 incident.status === 'awaiting' ? 'Ожидает' :
                 incident.status === 'overdue' ? 'Просрочено' :
                 incident.status === 'completed' ? 'Исполнено' : 'Исполнено с опозданием'}
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
              <span className="text-xs font-medium">Комментарии</span>
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
                <Label>Плановая дата</Label>
                <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm">{new Date(incident.plannedDate).toLocaleDateString('ru-RU')}</span>
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
                    <p className="text-sm font-medium">{incident.responsiblePersonnelId || 'Не назначен'}</p>
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
                      {incident.plannedDate ? new Date(incident.plannedDate).toLocaleDateString('ru-RU') : 'Не указан'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {incident.correctiveAction && (
              <div className="space-y-2">
                <Label>Корректирующие меры</Label>
                <p className="text-sm text-gray-700 dark:text-gray-300 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  {incident.correctiveAction}
                </p>
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
                  <p className="text-xs text-gray-600 dark:text-gray-400">Система</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(incident.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>

              {incident.status !== 'created' && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <Icon name="PlayCircle" size={16} className="text-purple-600" />
                    </div>
                    {incident.status !== 'in_progress' && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-medium text-sm">Взят в работу</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{incident.responsiblePersonnelId}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(incident.updatedAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              )}

              {(incident.status === 'awaiting' || incident.status === 'completed' || incident.status === 'completed_late') && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                      <Icon name="Eye" size={16} className="text-yellow-600" />
                    </div>
                    {incident.status !== 'awaiting' && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-medium text-sm">Отправлен на проверку</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(incident.updatedAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              )}

              {(incident.status === 'completed' || incident.status === 'completed_late') && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                    <Icon name="CheckCircle2" size={16} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Инцидент закрыт</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {incident.completedDate ? new Date(incident.completedDate).toLocaleString('ru-RU') : 'Недавно'}
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
                  disabled={!canEdit || incident.status === 'completed' || incident.status === 'completed_late'}
                />
              </div>
              
              {canEdit && incident.status !== 'completed' && incident.status !== 'completed_late' && (
                <Button onClick={handleSaveResolution} disabled={!resolution}>
                  <Icon name="Save" className="mr-2" size={16} />
                  Сохранить решение
                </Button>
              )}

              {(incident.status === 'completed' || incident.status === 'completed_late') && incident.completedDate && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle2" className="text-emerald-600" size={16} />
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                      Инцидент исполнен {new Date(incident.completedDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-6">
            <div className="space-y-4">
              {incident.notes ? (
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{incident.notes}</p>
                </div>
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