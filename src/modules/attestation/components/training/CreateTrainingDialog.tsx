import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface CreateTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTraining: (training: any) => void;
}

export default function CreateTrainingDialog({ open, onOpenChange, onCreateTraining }: CreateTrainingDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { personnel, organizations } = useSettingsStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: 'external' as 'external' | 'internal',
    trainingCenter: '',
    courseName: '',
    selectedEmployees: [] as string[],
    plannedDate: '',
    notes: ''
  });

  const tenantPersonnel = user?.tenantId 
    ? personnel.filter(p => p.tenantId === user.tenantId) 
    : [];

  const handleToggleEmployee = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedEmployees: prev.selectedEmployees.includes(employeeId)
        ? prev.selectedEmployees.filter(id => id !== employeeId)
        : [...prev.selectedEmployees, employeeId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.selectedEmployees.length === 0) {
      toast({ title: 'Ошибка', description: 'Выберите хотя бы одного сотрудника', variant: 'destructive' });
      return;
    }

    const newTraining = {
      id: `training-${Date.now()}`,
      number: `ЗТ-${String(Date.now()).slice(-6)}`,
      date: new Date().toISOString(),
      type: formData.type,
      status: 'pending' as const,
      employeeCount: formData.selectedEmployees.length,
      organization: formData.type === 'external' ? formData.trainingCenter : undefined,
      courseName: formData.courseName,
      employees: formData.selectedEmployees.map(id => {
        const emp = tenantPersonnel.find(p => p.id === id);
        return {
          id,
          name: emp?.fullName || '',
          position: emp?.position || ''
        };
      }),
      plannedDate: formData.plannedDate,
      notes: formData.notes
    };

    onCreateTraining(newTraining);

    toast({ 
      title: 'Заявка создана', 
      description: `Заявка на тренинг для ${formData.selectedEmployees.length} сотрудников успешно создана` 
    });

    setFormData({
      type: 'external',
      trainingCenter: '',
      courseName: '',
      selectedEmployees: [],
      plannedDate: '',
      notes: ''
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать заявку на тренинг</DialogTitle>
          <DialogDescription>
            Направление сотрудников на тренинг в учебный центр или СДО ИСП
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Тип тренинга *</Label>
            <RadioGroup 
              value={formData.type} 
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="external" id="external" />
                <Label htmlFor="external" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Icon name="Building" size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">Направление в УЦ</div>
                      <div className="text-sm text-muted-foreground">Внешний учебный центр</div>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="internal" id="internal" />
                <Label htmlFor="internal" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Icon name="MonitorPlay" size={20} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-medium">Направление в СДО ИСП</div>
                      <div className="text-sm text-muted-foreground">Система дистанционного обучения</div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.type === 'external' && (
            <div className="space-y-2">
              <Label>Учебный центр *</Label>
              <Input
                value={formData.trainingCenter}
                onChange={(e) => setFormData({ ...formData, trainingCenter: e.target.value })}
                placeholder="Например: УЦ 'Прогресс'"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Название курса / программы *</Label>
            <Input
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              placeholder="Например: Основы промышленной безопасности"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Планируемая дата</Label>
            <Input
              type="date"
              value={formData.plannedDate}
              onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Сотрудники * (выбрано: {formData.selectedEmployees.length})</Label>
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {tenantPersonnel.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Нет доступных сотрудников
                </div>
              ) : (
                <div className="divide-y">
                  {tenantPersonnel.map(person => {
                    const org = organizations.find(o => o.id === person.organizationId);
                    const isSelected = formData.selectedEmployees.includes(person.id);
                    return (
                      <div 
                        key={person.id} 
                        className={`p-3 cursor-pointer hover:bg-accent transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                        onClick={() => handleToggleEmployee(person.id)}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleEmployee(person.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{person.fullName}</div>
                            <div className="text-xs text-muted-foreground">
                              {person.position} • {org?.name || 'Без организации'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

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
