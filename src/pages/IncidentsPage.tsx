import { useState } from 'react';
import { useIncidentStore } from '@/stores/incidentStore';
import { useCatalogStore } from '@/stores/catalogStore';
import { useAuthStore } from '@/stores/authStore';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import type { IncidentPriority } from '@/types/incidents';

export default function IncidentsPage() {
  const { incidents, incidentTypes, addIncident } = useIncidentStore();
  const { objects } = useCatalogStore();
  const user = useAuthStore((state) => state.user);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    typeId: '',
    priority: 'medium' as IncidentPriority,
    objectId: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    addIncident({
      ...formData,
      tenantId: user.tenantId || 'tenant-1',
      status: 'new',
      source: 'manual',
      createdBy: user.id,
      createdByName: user.name,
      dueDate: new Date(formData.dueDate).toISOString()
    });
    
    setIsCreateDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      typeId: '',
      priority: 'medium',
      objectId: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700';
    }
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: 'Новый',
      in_progress: 'В работе',
      under_review: 'На проверке',
      closed: 'Закрыт'
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

  return (
    <div>
      <PageHeader
        title="Учет инцидентов"
        description="Регистрация и контроль нештатных ситуаций"
        icon="AlertCircle"
        action={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Icon name="Plus" size={18} />
                Зарегистрировать инцидент
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Регистрация инцидента</DialogTitle>
                  <DialogDescription>
                    Заполните данные о нештатной ситуации
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название инцидента *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Описание *</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="typeId">Тип инцидента *</Label>
                      <Select value={formData.typeId} onValueChange={(value) => setFormData({ ...formData, typeId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          {incidentTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Приоритет *</Label>
                      <Select value={formData.priority} onValueChange={(value: IncidentPriority) => setFormData({ ...formData, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Критический</SelectItem>
                          <SelectItem value="high">Высокий</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="low">Низкий</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="objectId">Объект *</Label>
                      <Select value={formData.objectId} onValueChange={(value) => setFormData({ ...formData, objectId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите объект" />
                        </SelectTrigger>
                        <SelectContent>
                          {objects.map((obj) => (
                            <SelectItem key={obj.id} value={obj.id}>{obj.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Срок устранения *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      <Icon name="Plus" className="mr-2" size={18} />
                      Зарегистрировать
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Отмена
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {incidents.map((incident) => {
          const incidentType = incidentTypes.find(t => t.id === incident.typeId);
          const obj = objects.find(o => o.id === incident.objectId);
          
          return (
            <Card key={incident.id} className="hover-scale">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{incident.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{incident.description}</p>
                    </div>
                    <Badge className={getPriorityColor(incident.priority)}>
                      {getPriorityLabel(incident.priority)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusColor(incident.status)}>
                      {getStatusLabel(incident.status)}
                    </Badge>
                    {incidentType && (
                      <Badge variant="outline">{incidentType.name}</Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    {obj && (
                      <div className="flex items-center gap-2">
                        <Icon name="Building" size={14} className="text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">{obj.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Icon name="User" size={14} className="text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {incident.assignedToName || 'Не назначен'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={14} className="text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        До: {new Date(incident.dueDate || '').toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Icon name="Eye" className="mr-1" size={14} />
                      Просмотр
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon name="MessageSquare" size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
