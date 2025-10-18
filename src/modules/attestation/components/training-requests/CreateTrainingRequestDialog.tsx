import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTrainingRequestsStore } from '@/stores/trainingRequestsStore';
import { useToast } from '@/hooks/use-toast';

interface CreateTrainingRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTrainingRequestDialog({ open, onOpenChange }: CreateTrainingRequestDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { personnel, organizations } = useSettingsStore();
  const { addRequest } = useTrainingRequestsStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    employeeId: '',
    programName: '',
    reason: 'mandatory' as 'mandatory' | 'expiring_qualification' | 'new_position' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    notes: '',
    expiryDate: ''
  });

  const tenantPersonnel = user?.tenantId 
    ? personnel.filter(p => p.tenantId === user.tenantId) 
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const employee = tenantPersonnel.find(p => p.id === formData.employeeId);
    if (!employee) {
      toast({ title: 'Ошибка', description: 'Выберите сотрудника', variant: 'destructive' });
      return;
    }

    const organization = organizations.find(o => o.id === employee.organizationId);

    addRequest({
      tenantId: user?.tenantId || '',
      employeeId: formData.employeeId,
      employeeName: employee.fullName,
      position: employee.position,
      organizationName: organization?.name || 'Не указана',
      programName: formData.programName,
      reason: formData.reason,
      priority: formData.priority,
      requestDate: new Date().toISOString(),
      status: 'pending',
      autoCreated: false,
      notes: formData.notes,
      expiryDate: formData.expiryDate || undefined
    });

    toast({ 
      title: 'Заявка создана', 
      description: `Заявка на обучение для ${employee.fullName} успешно создана` 
    });

    setFormData({
      employeeId: '',
      programName: '',
      reason: 'mandatory',
      priority: 'medium',
      notes: '',
      expiryDate: ''
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Создать заявку на обучение</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Сотрудник *</Label>
            <Select 
              value={formData.employeeId} 
              onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите сотрудника" />
              </SelectTrigger>
              <SelectContent>
                {tenantPersonnel.map(person => {
                  const org = organizations.find(o => o.id === person.organizationId);
                  return (
                    <SelectItem key={person.id} value={person.id}>
                      {person.fullName} — {person.position} ({org?.name || 'Без организации'})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Программа обучения *</Label>
            <Input
              value={formData.programName}
              onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
              placeholder="Например: Промышленная безопасность А.1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Причина *</Label>
              <Select 
                value={formData.reason} 
                onValueChange={(value: any) => setFormData({ ...formData, reason: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mandatory">Обязательная аттестация</SelectItem>
                  <SelectItem value="expiring_qualification">Истечение квалификации</SelectItem>
                  <SelectItem value="new_position">Новая должность</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Приоритет *</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.reason === 'expiring_qualification' && (
            <div className="space-y-2">
              <Label>Дата истечения квалификации</Label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Примечания</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              Создать заявку
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
