import { useState, useMemo } from 'react';
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

interface CreateTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const trainingTypes = [
  'Первичная подготовка',
  'Повышение квалификации',
  'Переподготовка',
  'Проверка знаний',
  'Стажировка',
  'Инструктаж',
];

const trainingCategories = [
  { value: 'industrial_safety', label: 'Промышленная безопасность', icon: 'Shield' },
  { value: 'electrical_safety', label: 'Электробезопасность', icon: 'Zap' },
  { value: 'labor_protection', label: 'Охрана труда', icon: 'HardHat' },
  { value: 'fire_safety', label: 'Пожарная безопасность', icon: 'Flame' },
  { value: 'height_work', label: 'Работы на высоте', icon: 'Mountain' },
  { value: 'medical', label: 'Медицинские осмотры', icon: 'Stethoscope' },
  { value: 'other', label: 'Другое', icon: 'MoreHorizontal' },
];



export default function CreateTrainingDialog({ open, onOpenChange }: CreateTrainingDialogProps) {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const allPersonnel = useSettingsStore((state) => state.personnel);
  const people = useSettingsStore((state) => state.people);
  const positions = useSettingsStore((state) => state.positions);
  const allContractors = useSettingsStore((state) => state.contractors);
  
  const trainingOrgs = useMemo(() => 
    user?.tenantId ? allContractors.filter(c => c.tenantId === user.tenantId && c.type === 'training_center') : []
  , [allContractors, user?.tenantId]);
  
  const tenantPersonnel = useMemo(() => 
    user?.tenantId ? allPersonnel.filter(p => p.tenantId === user.tenantId) : []
  , [allPersonnel, user?.tenantId]);
  
  const employees = useMemo(() => 
    tenantPersonnel.map(p => {
      const info = getPersonnelFullInfo(p, people, positions);
      return {
        id: p.id,
        name: info.fullName,
        position: info.position,
        department: '—'
      };
    })
  , [tenantPersonnel, people, positions]);
  
  const [step, setStep] = useState(1);
  const [trainingTitle, setTrainingTitle] = useState('');
  const [trainingType, setTrainingType] = useState('');
  const [trainingCategory, setTrainingCategory] = useState('');
  const [trainingProgram, setTrainingProgram] = useState('');
  const [organization, setOrganization] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cost, setCost] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [searchEmployee, setSearchEmployee] = useState('');

  const selectedCategory = trainingCategories.find(c => c.value === trainingCategory);

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
    if (step === 1 && trainingCategory) {
      setStep(2);
    } else if (step === 2 && trainingTitle && trainingType && organization && startDate && endDate) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = () => {
    const totalCost = cost ? parseFloat(cost) : 0;
    const selectedCategory = trainingCategories.find(c => c.value === trainingCategory);
    toast({
      title: "Обучение запланировано",
      description: `${trainingTitle} - ${selectedEmployees.size} сотрудников, ${totalCost.toLocaleString('ru')} ₽`,
    });
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setTrainingTitle('');
    setTrainingType('');
    setTrainingCategory('');
    setTrainingProgram('');
    setOrganization('');
    setStartDate('');
    setEndDate('');
    setCost('');
    setSelectedEmployees(new Set());
    setSearchEmployee('');
    onOpenChange(false);
  };

  const calculateDuration = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const calculateCostPerPerson = () => {
    if (cost && selectedEmployees.size > 0) {
      return Math.round(parseFloat(cost) / selectedEmployees.size);
    }
    return 0;
  };

  const duration = calculateDuration();
  const costPerPerson = calculateCostPerPerson();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="GraduationCap" size={20} />
            Планирование обучения
          </DialogTitle>
          <DialogDescription>
            Шаг {step} из 3: {step === 1 ? 'Выбор категории' : step === 2 ? 'Информация об обучении' : 'Выбор участников'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Выберите категорию обучения</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Категория определяет требования и программу обучения
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trainingCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setTrainingCategory(category.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                      trainingCategory === category.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon name={category.icon as any} size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{category.label}</div>
                      </div>
                      {trainingCategory === category.value && (
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
              {selectedCategory && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon name={selectedCategory.icon as any} size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{selectedCategory.label}</div>
                    <div className="text-xs text-muted-foreground">Выбранная категория</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="trainingTitle">Название обучения *</Label>
                <Input
                  id="trainingTitle"
                  placeholder="Промышленная безопасность А.1"
                  value={trainingTitle}
                  onChange={(e) => setTrainingTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trainingType">Тип обучения *</Label>
                  <Select value={trainingType} onValueChange={setTrainingType}>
                    <SelectTrigger id="trainingType">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainingTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Организация *</Label>
                  <Select value={organization} onValueChange={setOrganization}>
                    <SelectTrigger id="organization">
                      <SelectValue placeholder="Выберите УЦ" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainingOrgs.filter(org => org.status === 'active').map((org) => (
                        <SelectItem key={org.id} value={org.contractorName}>
                          <div className="flex flex-col">
                            <span>{org.contractorName}</span>
                            {org.services && org.services.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {org.services.includes('full_training') && 'Полное обучение'}
                                {org.services.includes('certification') && ' • Аттестация'}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                      {trainingOrgs.filter(org => org.status === 'active').length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Нет доступных контрагентов (учебных центров)
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainingProgram">Программа обучения (необязательно)</Label>
                <Textarea
                  id="trainingProgram"
                  placeholder="Краткое описание программы обучения..."
                  value={trainingProgram}
                  onChange={(e) => setTrainingProgram(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Дата начала *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Дата окончания *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>
              </div>

              {duration > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Clock" size={14} />
                  <span>Длительность: {duration} {duration === 1 ? 'день' : duration < 5 ? 'дня' : 'дней'}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="cost">Стоимость (необязательно)</Label>
                <div className="relative">
                  <Input
                    id="cost"
                    type="number"
                    placeholder="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Выберите участников обучения</Label>
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

              {selectedEmployees.size > 0 && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Участников:</span>
                    <span className="font-medium">{selectedEmployees.size} чел.</span>
                  </div>
                  {duration > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Длительность:</span>
                      <span className="font-medium">{duration} {duration === 1 ? 'день' : duration < 5 ? 'дня' : 'дней'}</span>
                    </div>
                  )}
                  {cost && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Общая стоимость:</span>
                        <span className="font-medium">{parseFloat(cost).toLocaleString('ru')} ₽</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Стоимость на человека:</span>
                        <span className="font-medium">{costPerPerson.toLocaleString('ru')} ₽</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <Icon name="ChevronLeft" size={16} className="mr-1" />
              Назад
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={
                step === 1
                  ? !trainingCategory
                  : !trainingTitle || !trainingType || !organization || !startDate || !endDate
              }
            >
              Далее
              <Icon name="ChevronRight" size={16} className="ml-1" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={selectedEmployees.size === 0}>
              <Icon name="CheckCircle2" size={16} className="mr-2" />
              Запланировать обучение
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}