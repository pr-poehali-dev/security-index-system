import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialOrderType?: string;
}

const orderTypes = [
  { value: 'attestation', label: 'Аттестация', icon: 'Award', color: 'text-blue-600 bg-blue-100' },
  { value: 'training', label: 'Обучение', icon: 'GraduationCap', color: 'text-purple-600 bg-purple-100' },
  { value: 'suspension', label: 'Отстранение', icon: 'Ban', color: 'text-red-600 bg-red-100' },
  { value: 'sdo', label: 'СДО', icon: 'Monitor', color: 'text-cyan-600 bg-cyan-100' },
  { value: 'training_center', label: 'Учебный центр', icon: 'Building2', color: 'text-violet-600 bg-violet-100' },
  { value: 'internal_attestation', label: 'ЕПТ организации', icon: 'ClipboardCheck', color: 'text-indigo-600 bg-indigo-100' },
  { value: 'rostechnadzor', label: 'Ростехнадзор', icon: 'Shield', color: 'text-emerald-600 bg-emerald-100' },
];



export default function CreateOrderDialog({ open, onOpenChange, initialOrderType }: CreateOrderDialogProps) {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { personnel, people, positions, getPersonnelByTenant } = useSettingsStore();
  
  const tenantPersonnel = user?.tenantId ? getPersonnelByTenant(user.tenantId) : [];
  const employees = tenantPersonnel.map(p => {
    const info = getPersonnelFullInfo(p, people, positions);
    return {
      id: p.id,
      name: info.fullName,
      position: info.position,
      department: '—'
    };
  });
  const [step, setStep] = useState(initialOrderType ? 2 : 1);
  const [orderType, setOrderType] = useState(initialOrderType || '');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderTitle, setOrderTitle] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [searchEmployee, setSearchEmployee] = useState('');

  const selectedType = orderTypes.find(t => t.value === orderType);

  useEffect(() => {
    if (initialOrderType && !orderTitle) {
      setOrderTitle(getDefaultTitle(initialOrderType));
    }
  }, [initialOrderType]);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  const handleEmployeeToggle = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(emp => emp.id)));
    }
  };

  const handleNext = () => {
    if (step === 1 && orderType) {
      setStep(2);
    } else if (step === 2 && orderNumber && orderTitle) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = () => {
    const selectedType = orderTypes.find(t => t.value === orderType);
    toast({
      title: "Приказ создан",
      description: `${selectedType?.label} №${orderNumber} на ${selectedEmployees.size} сотрудников`,
    });
    handleClose();
  };

  const handleClose = () => {
    setStep(initialOrderType ? 2 : 1);
    setOrderType(initialOrderType || '');
    setOrderNumber('');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setOrderTitle('');
    setOrderDescription('');
    setSelectedEmployees(new Set());
    setSearchEmployee('');
    onOpenChange(false);
  };

  const getDefaultTitle = (type: string) => {
    switch (type) {
      case 'attestation':
        return 'О проведении аттестации';
      case 'training':
        return 'О направлении на обучение';
      case 'suspension':
        return 'Об отстранении от работы';
      case 'sdo':
        return 'О направлении на обучение в СДО';
      case 'training_center':
        return 'О направлении в учебный центр';
      case 'internal_attestation':
        return 'О проведении внутренней аттестации';
      case 'rostechnadzor':
        return 'О направлении на аттестацию в Ростехнадзор';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="FileText" size={20} />
            Создание приказа
          </DialogTitle>
          <DialogDescription>
            {initialOrderType ? (
              <>Шаг {step - 1} из 2: {step === 2 ? 'Основная информация' : 'Выбор сотрудников'}</>
            ) : (
              <>Шаг {step} из 3: {step === 1 ? 'Выбор типа' : step === 2 ? 'Основная информация' : 'Выбор сотрудников'}</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Выберите тип приказа</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Тип приказа определяет его назначение и доступные действия
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {orderTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setOrderType(type.value);
                      setOrderTitle(getDefaultTitle(type.value));
                    }}
                    className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                      orderType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <Icon name={type.icon as any} size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium mb-1">{type.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.value === 'attestation' && 'Проведение аттестации по требованиям'}
                          {type.value === 'training' && 'Направление на обучение в сторонние организации'}
                          {type.value === 'suspension' && 'Временное отстранение от работы'}
                          {type.value === 'sdo' && 'Обучение через систему дистанционного обучения'}
                          {type.value === 'training_center' && 'Направление в аккредитованный учебный центр'}
                          {type.value === 'internal_attestation' && 'Аттестация в единой платформе тестирования'}
                          {type.value === 'rostechnadzor' && 'Регистрация и аттестация в Ростехнадзоре'}
                        </div>
                      </div>
                      {orderType === type.value && (
                        <Icon name="CheckCircle2" size={20} className="text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {selectedType && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className={`p-2 rounded-lg ${selectedType.color}`}>
                    <Icon name={selectedType.icon as any} size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{selectedType.label}</div>
                    <div className="text-xs text-muted-foreground">Выбранный тип приказа</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Номер приказа *</Label>
                  <Input
                    id="orderNumber"
                    placeholder="15-А"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Дата приказа *</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderTitle">Название приказа *</Label>
                <Input
                  id="orderTitle"
                  placeholder="О проведении аттестации..."
                  value={orderTitle}
                  onChange={(e) => setOrderTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderDescription">Описание (необязательно)</Label>
                <Textarea
                  id="orderDescription"
                  placeholder="Дополнительная информация о приказе..."
                  value={orderDescription}
                  onChange={(e) => setOrderDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Выберите сотрудников</Label>
                  <p className="text-sm text-muted-foreground">
                    Выбрано: {selectedEmployees.size} из {filteredEmployees.length}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="gap-2"
                >
                  {selectedEmployees.size === filteredEmployees.length ? (
                    <>
                      <Icon name="X" size={14} />
                      Снять все
                    </>
                  ) : (
                    <>
                      <Icon name="CheckCheck" size={14} />
                      Выбрать все
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск по ФИО, должности или подразделению..."
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`flex items-center gap-3 p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer ${
                      selectedEmployees.has(employee.id) ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleEmployeeToggle(employee.id)}
                  >
                    <Checkbox
                      checked={selectedEmployees.has(employee.id)}
                      onCheckedChange={() => handleEmployeeToggle(employee.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {employee.position} • {employee.department}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Users" size={32} className="mx-auto mb-2" />
                  <p>Сотрудники не найдены</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {(initialOrderType ? step > 2 : step > 1) && (
            <Button variant="outline" onClick={handleBack}>
              <Icon name="ChevronLeft" size={16} className="mr-1" />
              Назад
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} disabled={step === 1 ? !orderType : !orderNumber || !orderTitle}>
              Далее
              <Icon name="ChevronRight" size={16} className="ml-1" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={selectedEmployees.size === 0}>
              <Icon name="CheckCircle2" size={16} className="mr-2" />
              Создать приказ
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}