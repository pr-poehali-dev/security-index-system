import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useAuthStore } from '@/stores/authStore';

interface AuditPlan {
  id: string;
  objectId: string;
  auditType: string;
  startDate: string;
  endDate: string;
  auditorName: string;
  scope: string;
  status: 'planned' | 'in_progress' | 'completed';
}

export default function PlanningTab() {
  const user = useAuthStore((state) => state.user);
  const { getFacilitiesByTenant } = useFacilitiesStore();
  const objects = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];
  const [plans, setPlans] = useState<AuditPlan[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    objectId: '',
    auditType: 'scheduled',
    startDate: '',
    endDate: '',
    auditorName: '',
    scope: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.objectId) {
      newErrors.objectId = 'Выберите объект';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Укажите дату начала';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Укажите дату окончания';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'Дата окончания не может быть раньше даты начала';
    }
    if (!formData.auditorName.trim()) {
      newErrors.auditorName = 'Укажите аудитора';
    }
    if (!formData.scope.trim()) {
      newErrors.scope = 'Опишите область проверки';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newPlan: AuditPlan = {
      id: `audit-${Date.now()}`,
      objectId: formData.objectId,
      auditType: formData.auditType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      auditorName: formData.auditorName.trim(),
      scope: formData.scope.trim(),
      status: 'planned'
    };

    setPlans([...plans, newPlan]);
    toast.success('Аудит успешно запланирован');
    
    setFormData({
      objectId: '',
      auditType: 'scheduled',
      startDate: '',
      endDate: '',
      auditorName: '',
      scope: ''
    });
    setErrors({});
    setShowForm(false);
  };

  const getObjectName = (objectId: string) => {
    const obj = objects.find(o => o.id === objectId);
    return obj?.name || 'Не найден';
  };

  const getStatusBadge = (status: AuditPlan['status']) => {
    const variants = {
      planned: { label: 'Запланирован', variant: 'default' as const },
      in_progress: { label: 'В процессе', variant: 'default' as const },
      completed: { label: 'Завершён', variant: 'secondary' as const }
    };
    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      scheduled: 'Плановый',
      unscheduled: 'Внеплановый',
      emergency: 'Экстренный'
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Планирование аудитов</h2>
          <p className="text-sm text-muted-foreground">
            Создавайте планы аудитов промышленной безопасности
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Icon name={showForm ? 'X' : 'Plus'} size={16} className="mr-2" />
          {showForm ? 'Отмена' : 'Запланировать аудит'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Calendar" size={20} />
              Новый план аудита
            </CardTitle>
            <CardDescription>
              Заполните данные для планирования аудита промышленной безопасности
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="objectId">
                    Объект проверки <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.objectId}
                    onValueChange={(value) => setFormData({ ...formData, objectId: value })}
                  >
                    <SelectTrigger id="objectId" className={errors.objectId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Выберите объект" />
                    </SelectTrigger>
                    <SelectContent>
                      {objects.map((obj) => (
                        <SelectItem key={obj.id} value={obj.id}>
                          {obj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.objectId && <p className="text-sm text-red-500">{errors.objectId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auditType">
                    Тип аудита <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.auditType}
                    onValueChange={(value) => setFormData({ ...formData, auditType: value })}
                  >
                    <SelectTrigger id="auditType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Плановый</SelectItem>
                      <SelectItem value="unscheduled">Внеплановый</SelectItem>
                      <SelectItem value="emergency">Экстренный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auditorName">
                    Ответственный аудитор <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="auditorName"
                    value={formData.auditorName}
                    onChange={(e) => setFormData({ ...formData, auditorName: e.target.value })}
                    placeholder="Иванов Иван Иванович"
                    className={errors.auditorName ? 'border-red-500' : ''}
                  />
                  {errors.auditorName && <p className="text-sm text-red-500">{errors.auditorName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    Дата начала <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={errors.startDate ? 'border-red-500' : ''}
                  />
                  {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    Дата окончания <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={errors.endDate ? 'border-red-500' : ''}
                  />
                  {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="scope">
                    Область проверки <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="scope"
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    placeholder="Опишите, что будет проверяться в ходе аудита"
                    rows={3}
                    className={errors.scope ? 'border-red-500' : ''}
                  />
                  {errors.scope && <p className="text-sm text-red-500">{errors.scope}</p>}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Отмена
                </Button>
                <Button type="submit">
                  <Icon name="Save" size={16} className="mr-2" />
                  Запланировать
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {plans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <Icon name="Calendar" size={48} className="text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-muted-foreground mb-2">
                Нет запланированных аудитов
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Создайте первый план аудита для отслеживания проверок
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Icon name="Plus" size={16} className="mr-2" />
                Запланировать аудит
              </Button>
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="FileCheck" size={20} />
                      {getObjectName(plan.objectId)}
                    </CardTitle>
                    <CardDescription>
                      {getTypeLabel(plan.auditType)} аудит • {plan.auditorName}
                    </CardDescription>
                  </div>
                  {getStatusBadge(plan.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={16} className="text-muted-foreground" />
                      <span className="text-muted-foreground">Начало:</span>
                      <span className="font-medium">
                        {new Date(plan.startDate).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={16} className="text-muted-foreground" />
                      <span className="text-muted-foreground">Окончание:</span>
                      <span className="font-medium">
                        {new Date(plan.endDate).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Область проверки:</p>
                    <p className="text-sm text-muted-foreground">{plan.scope}</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <Icon name="Edit" size={14} className="mr-2" />
                      Редактировать
                    </Button>
                    <Button size="sm" variant="outline">
                      <Icon name="Trash2" size={14} className="mr-2" />
                      Удалить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}