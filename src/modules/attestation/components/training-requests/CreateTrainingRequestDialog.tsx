import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTrainingRequestsStore } from '@/stores/trainingRequestsStore';
import { useTrainingCentersStore } from '@/stores/trainingCentersStore';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { 
  certificationCategories, 
  getAreasForCategory 
} from '@/stores/mockData/certificationAreas';

interface CreateTrainingRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EmployeeSelection {
  employeeId: string;
  areas: string[];
}

export default function CreateTrainingRequestDialog({ open, onOpenChange }: CreateTrainingRequestDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { personnel, organizations } = useSettingsStore();
  const { addRequest } = useTrainingRequestsStore();
  const { getActiveConnections } = useTrainingCentersStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    trainingCenterTenantId: '',
    category: certificationCategories[0],
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    notes: ''
  });

  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeSelection[]>([]);
  const [filterByArea, setFilterByArea] = useState<string>('');

  const tenantPersonnel = user?.tenantId 
    ? personnel.filter(p => p.tenantId === user.tenantId) 
    : [];

  const activeConnections = user?.tenantId 
    ? getActiveConnections(user.tenantId)
    : [];

  const availableAreas = useMemo(() => 
    getAreasForCategory(formData.category),
    [formData.category]
  );

  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => {
      const exists = prev.find(e => e.employeeId === employeeId);
      if (exists) {
        return prev.filter(e => e.employeeId !== employeeId);
      } else {
        return [...prev, { employeeId, areas: [] }];
      }
    });
  };

  const handleToggleArea = (employeeId: string, area: string) => {
    setSelectedEmployees(prev => 
      prev.map(emp => {
        if (emp.employeeId === employeeId) {
          const hasArea = emp.areas.includes(area);
          return {
            ...emp,
            areas: hasArea 
              ? emp.areas.filter(a => a !== area)
              : [...emp.areas, area]
          };
        }
        return emp;
      })
    );
  };

  const handleSelectAllByArea = () => {
    if (!filterByArea) {
      toast({ 
        title: 'Ошибка', 
        description: 'Выберите область аттестации для фильтра', 
        variant: 'destructive' 
      });
      return;
    }

    const newSelections: EmployeeSelection[] = tenantPersonnel.map(person => ({
      employeeId: person.id,
      areas: [filterByArea]
    }));

    setSelectedEmployees(newSelections);
    toast({ 
      title: 'Сотрудники выбраны', 
      description: `Выбрано ${newSelections.length} сотрудников с областью "${filterByArea}"` 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEmployees.length === 0) {
      toast({ title: 'Ошибка', description: 'Выберите хотя бы одного сотрудника', variant: 'destructive' });
      return;
    }

    const hasEmployeeWithoutAreas = selectedEmployees.some(emp => emp.areas.length === 0);
    if (hasEmployeeWithoutAreas) {
      toast({ 
        title: 'Ошибка', 
        description: 'Для каждого сотрудника должна быть выбрана хотя бы одна область', 
        variant: 'destructive' 
      });
      return;
    }

    const trainingCenter = activeConnections.find(c => c.trainingCenterTenantId === formData.trainingCenterTenantId);

    selectedEmployees.forEach(({ employeeId, areas }) => {
      const employee = tenantPersonnel.find(p => p.id === employeeId);
      if (!employee) return;

      const organization = organizations.find(o => o.id === employee.organizationId);

      areas.forEach(area => {
        addRequest({
          tenantId: user?.tenantId || '',
          employeeId,
          employeeName: employee.fullName,
          position: employee.position,
          organizationName: organization?.name || 'Не указана',
          programName: area,
          reason: 'mandatory',
          priority: formData.priority,
          requestDate: new Date().toISOString(),
          status: 'pending',
          autoCreated: false,
          notes: `${formData.notes}\nУЦ: ${trainingCenter?.trainingCenterName || 'Не указан'}`,
          trainingCenterTenantId: formData.trainingCenterTenantId || undefined
        });
      });
    });

    const totalRequests = selectedEmployees.reduce((sum, emp) => sum + emp.areas.length, 0);

    toast({ 
      title: 'Заявки созданы', 
      description: `Создано ${totalRequests} заявок на обучение для ${selectedEmployees.length} сотрудников` 
    });

    setFormData({
      trainingCenterTenantId: '',
      category: certificationCategories[0],
      priority: 'medium',
      notes: ''
    });
    setSelectedEmployees([]);
    setFilterByArea('');

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать заявку на обучение</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Учебный центр *</Label>
              <Select 
                value={formData.trainingCenterTenantId} 
                onValueChange={(value) => setFormData({ ...formData, trainingCenterTenantId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите учебный центр" />
                </SelectTrigger>
                <SelectContent>
                  {activeConnections.map(conn => (
                    <SelectItem key={conn.id} value={conn.trainingCenterTenantId}>
                      <div className="flex flex-col">
                        <span>{conn.trainingCenterName}</span>
                        <span className="text-xs text-muted-foreground">
                          {conn.specializations.join(', ')}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeConnections.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Нет активных подключений к УЦ
                </p>
              )}
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

          <div className="space-y-2">
            <Label>Категория аттестации *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value: any) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {certificationCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Быстрый выбор по области</Label>
              <div className="flex items-center gap-2">
                <Select 
                  value={filterByArea} 
                  onValueChange={setFilterByArea}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Выберите область" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAreas.map(area => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectAllByArea}
                  disabled={!filterByArea}
                >
                  <Icon name="Users" size={16} className="mr-2" />
                  Выбрать всех
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Сотрудники и области * 
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (выбрано: {selectedEmployees.length} сотрудников, {selectedEmployees.reduce((sum, e) => sum + e.areas.length, 0)} заявок)
              </span>
            </Label>
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {tenantPersonnel.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Нет доступных сотрудников
                </div>
              ) : (
                <div className="divide-y">
                  {tenantPersonnel.map(person => {
                    const org = organizations.find(o => o.id === person.organizationId);
                    const selection = selectedEmployees.find(e => e.employeeId === person.id);
                    const isSelected = !!selection;
                    
                    return (
                      <div key={person.id} className={`p-3 ${isSelected ? 'bg-primary/5' : ''}`}>
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleEmployee(person.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{person.fullName}</div>
                            <div className="text-xs text-muted-foreground mb-2">
                              {person.position} • {org?.name || 'Без организации'}
                            </div>
                            
                            {isSelected && (
                              <div className="space-y-2 mt-2 pl-4 border-l-2 border-primary/20">
                                <div className="text-xs font-medium text-muted-foreground">
                                  Области аттестации:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {availableAreas.map(area => {
                                    const isAreaSelected = selection.areas.includes(area);
                                    return (
                                      <Badge
                                        key={area}
                                        variant={isAreaSelected ? 'default' : 'outline'}
                                        className="cursor-pointer text-xs"
                                        onClick={() => handleToggleArea(person.id, area)}
                                      >
                                        {isAreaSelected && <Icon name="Check" size={12} className="mr-1" />}
                                        {area}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
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
              Создать {selectedEmployees.reduce((sum, e) => sum + e.areas.length, 0)} заявок
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
