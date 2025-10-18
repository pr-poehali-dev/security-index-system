import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAttestationOrdersStore } from '@/stores/attestationOrdersStore';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface CreateAttestationOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EmployeeSelection {
  personnelId: string;
  attestationArea: string;
  dpoQualificationId?: string;
  certificateNumber: string;
  certificateDate: string;
}

export default function CreateAttestationOrderDialog({ open, onOpenChange }: CreateAttestationOrderDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { personnel, organizations } = useSettingsStore();
  const { addOrder, addOrderEmployee } = useAttestationOrdersStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
    attestationType: 'rostechnadzor' as 'rostechnadzor' | 'company_commission',
    status: 'draft' as 'draft' | 'active',
    notes: ''
  });

  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeSelection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const tenantPersonnel = useMemo(() => {
    if (!user?.tenantId) return [];
    const filtered = personnel.filter(p => p.tenantId === user.tenantId);
    
    if (!searchQuery) return filtered;
    
    const query = searchQuery.toLowerCase();
    return filtered.filter(p => 
      p.fullName.toLowerCase().includes(query) ||
      p.position.toLowerCase().includes(query)
    );
  }, [personnel, user?.tenantId, searchQuery]);

  const handleToggleEmployee = (personnelId: string) => {
    const person = tenantPersonnel.find(p => p.id === personnelId);
    if (!person) return;

    const isSelected = selectedEmployees.some(e => e.personnelId === personnelId);
    
    if (isSelected) {
      setSelectedEmployees(prev => prev.filter(e => e.personnelId !== personnelId));
    } else {
      const latestQualification = person.dpoQualifications && person.dpoQualifications.length > 0
        ? person.dpoQualifications.sort((a, b) => 
            new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
          )[0]
        : null;

      setSelectedEmployees(prev => [...prev, {
        personnelId,
        attestationArea: latestQualification?.programName || '',
        dpoQualificationId: latestQualification?.id,
        certificateNumber: latestQualification?.certificateNumber || '',
        certificateDate: latestQualification?.issueDate || ''
      }]);
    }
  };

  const handleUpdateEmployee = (personnelId: string, updates: Partial<EmployeeSelection>) => {
    setSelectedEmployees(prev => 
      prev.map(emp => emp.personnelId === personnelId ? { ...emp, ...updates } : emp)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.number.trim()) {
      toast({ title: 'Ошибка', description: 'Укажите номер приказа', variant: 'destructive' });
      return;
    }

    if (selectedEmployees.length === 0) {
      toast({ title: 'Ошибка', description: 'Выберите хотя бы одного сотрудника', variant: 'destructive' });
      return;
    }

    const hasInvalidEmployee = selectedEmployees.some(emp => 
      !emp.attestationArea.trim() || !emp.certificateNumber.trim() || !emp.certificateDate
    );

    if (hasInvalidEmployee) {
      toast({ 
        title: 'Ошибка', 
        description: 'Заполните все обязательные поля для каждого сотрудника', 
        variant: 'destructive' 
      });
      return;
    }

    const orderId = addOrder({
      tenantId: user?.tenantId || '',
      number: formData.number,
      date: formData.date,
      status: formData.status,
      attestationType: formData.attestationType,
      employeeIds: selectedEmployees.map(e => e.personnelId),
      notes: formData.notes
    });

    selectedEmployees.forEach(emp => {
      const person = tenantPersonnel.find(p => p.id === emp.personnelId);
      if (!person) return;

      const org = organizations.find(o => o.id === person.organizationId);

      addOrderEmployee({
        orderId,
        personnelId: emp.personnelId,
        organizationName: org?.name || 'Не указана',
        fullName: person.fullName,
        position: person.position,
        attestationArea: emp.attestationArea,
        dpoQualificationId: emp.dpoQualificationId,
        certificateNumber: emp.certificateNumber,
        certificateDate: emp.certificateDate
      });
    });

    toast({ 
      title: 'Приказ создан', 
      description: `Приказ ${formData.number} успешно создан с ${selectedEmployees.length} сотрудниками` 
    });

    setFormData({
      number: '',
      date: new Date().toISOString().split('T')[0],
      attestationType: 'rostechnadzor',
      status: 'draft',
      notes: ''
    });
    setSelectedEmployees([]);
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать приказ на аттестацию</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Номер приказа *</Label>
              <Input
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="ПА-001-2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Дата приказа *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Статус *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Черновик</SelectItem>
                  <SelectItem value="active">Активен</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Тип аттестации *</Label>
            <Select 
              value={formData.attestationType} 
              onValueChange={(value: any) => setFormData({ ...formData, attestationType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rostechnadzor">Ростехнадзор</SelectItem>
                <SelectItem value="company_commission">Комиссия предприятия</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>
              Сотрудники *
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (выбрано: {selectedEmployees.length})
              </span>
            </Label>
            
            <Input
              placeholder="Поиск по ФИО или должности..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {tenantPersonnel.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {searchQuery ? 'Сотрудники не найдены' : 'Нет доступных сотрудников'}
                </div>
              ) : (
                <div className="divide-y">
                  {tenantPersonnel.map(person => {
                    const org = organizations.find(o => o.id === person.organizationId);
                    const selection = selectedEmployees.find(e => e.personnelId === person.id);
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
                            <div className="text-xs text-muted-foreground mb-1">
                              {person.position} • {org?.name || 'Без организации'}
                            </div>
                            
                            {person.dpoQualifications && person.dpoQualifications.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {person.dpoQualifications.slice(0, 2).map(qual => (
                                  <Badge key={qual.id} variant="outline" className="text-xs">
                                    {qual.programName}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {isSelected && selection && (
                              <div className="mt-3 space-y-2 pl-4 border-l-2 border-primary/20">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Область аттестации *</Label>
                                    <Input
                                      size={1}
                                      value={selection.attestationArea}
                                      onChange={(e) => handleUpdateEmployee(person.id, { attestationArea: e.target.value })}
                                      placeholder="А.1 Основы..."
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">№ удостоверения ДПО *</Label>
                                    <Input
                                      size={1}
                                      value={selection.certificateNumber}
                                      onChange={(e) => handleUpdateEmployee(person.id, { certificateNumber: e.target.value })}
                                      placeholder="ДПО-2024-001"
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Дата ДПО *</Label>
                                    <Input
                                      type="date"
                                      value={selection.certificateDate}
                                      onChange={(e) => handleUpdateEmployee(person.id, { certificateDate: e.target.value })}
                                      className="h-8 text-xs"
                                    />
                                  </div>
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
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              Создать приказ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
