import { useState, useEffect, useMemo } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCertificationStore } from '@/stores/certificationStore';
import { getPersonnelFullInfo, getCertificationStatus } from '@/lib/utils/personnelUtils';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialOrderType?: string;
}

const orderTypes = [
  { 
    value: 'attestation', 
    label: 'Аттестация', 
    icon: 'Award', 
    color: 'text-blue-600 bg-blue-100',
    description: 'Проведение аттестации сотрудников по требованиям' 
  },
  { 
    value: 'training', 
    label: 'Обучение', 
    icon: 'GraduationCap', 
    color: 'text-purple-600 bg-purple-100',
    description: 'Направление сотрудников на обучение' 
  },
  { 
    value: 'suspension', 
    label: 'Отстранение', 
    icon: 'Ban', 
    color: 'text-red-600 bg-red-100',
    description: 'Временное отстранение сотрудников от работы' 
  },
];



export default function CreateOrderDialog({ open, onOpenChange, initialOrderType }: CreateOrderDialogProps) {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { personnel, people, positions, getPersonnelByTenant, departments: deptList } = useSettingsStore();
  const { certifications } = useCertificationStore();
  
  const tenantPersonnel = user?.tenantId ? getPersonnelByTenant(user.tenantId) : [];
  
  const employees = useMemo(() => {
    return tenantPersonnel.map(p => {
      const info = getPersonnelFullInfo(p, people, positions);
      const dept = deptList.find(d => d.id === p.departmentId);
      const employeeCerts = certifications.filter(c => c.personnelId === p.id);
      
      return {
        id: p.id,
        name: info.fullName,
        position: info.position,
        department: dept?.name || '—',
        certifications: employeeCerts.map(cert => {
          const { status, daysLeft } = getCertificationStatus(cert.expiryDate);
          return {
            id: cert.id,
            category: cert.category,
            area: cert.area,
            issueDate: cert.issueDate,
            expiryDate: cert.expiryDate,
            status,
            daysLeft
          };
        })
      };
    });
  }, [tenantPersonnel, people, positions, deptList, certifications]);
  
  const [step, setStep] = useState(initialOrderType ? 2 : 1);
  const [orderType, setOrderType] = useState(initialOrderType || '');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderTitle, setOrderTitle] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [employeeSelections, setEmployeeSelections] = useState<Map<string, Set<string>>>(new Map());
  const [searchEmployee, setSearchEmployee] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const selectedType = orderTypes.find(t => t.value === orderType);

  useEffect(() => {
    if (initialOrderType && !orderTitle) {
      setOrderTitle(getDefaultTitle(initialOrderType));
    }
  }, [initialOrderType]);

  const allCertifications = useMemo(() => {
    const certs: Array<any> = [];
    employees.forEach(emp => {
      emp.certifications.forEach(cert => {
        certs.push({
          ...cert,
          employeeId: emp.id,
          employeeName: emp.name,
          position: emp.position,
          department: emp.department
        });
      });
    });
    return certs;
  }, [employees]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(allCertifications.map(c => c.category))).filter(cat => cat && cat.trim() !== '');
  }, [allCertifications]);

  const filteredCertifications = useMemo(() => {
    return allCertifications.filter(cert => {
      const matchesSearch =
        cert.area.toLowerCase().includes(searchEmployee.toLowerCase()) ||
        cert.category.toLowerCase().includes(searchEmployee.toLowerCase()) ||
        cert.employeeName.toLowerCase().includes(searchEmployee.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || cert.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allCertifications, searchEmployee, categoryFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
      case 'expiring_soon':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      case 'expired':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'valid':
        return 'Действует';
      case 'expiring_soon':
        return 'Истекает';
      case 'expired':
        return 'Просрочен';
      default:
        return status;
    }
  };

  const isAreaSelected = (employeeId: string, certId: string) => {
    return employeeSelections.get(employeeId)?.has(certId) || false;
  };

  const toggleArea = (employeeId: string, certId: string) => {
    const newSelections = new Map(employeeSelections);
    const employeeAreas = newSelections.get(employeeId) || new Set<string>();
    
    if (employeeAreas.has(certId)) {
      employeeAreas.delete(certId);
    } else {
      employeeAreas.add(certId);
    }
    
    newSelections.set(employeeId, employeeAreas);
    setEmployeeSelections(newSelections);
  };

  const toggleEmployee = (employeeId: string, allAreas: string[]) => {
    const newSelections = new Map(employeeSelections);
    const employeeAreas = newSelections.get(employeeId) || new Set<string>();
    
    if (employeeAreas.size === allAreas.length) {
      newSelections.set(employeeId, new Set());
    } else {
      newSelections.set(employeeId, new Set(allAreas));
    }
    
    setEmployeeSelections(newSelections);
  };

  const selectAll = () => {
    const newSelections = new Map<string, Set<string>>();
    filteredCertifications.forEach(cert => {
      const employeeAreas = newSelections.get(cert.employeeId) || new Set<string>();
      employeeAreas.add(cert.id);
      newSelections.set(cert.employeeId, employeeAreas);
    });
    setEmployeeSelections(newSelections);
  };

  const clearAll = () => {
    setEmployeeSelections(new Map());
  };

  const getTotalSelected = () => {
    let total = 0;
    employeeSelections.forEach(areas => {
      total += areas.size;
    });
    return total;
  };

  const getEmployeesWithSelections = () => {
    return employees.filter(emp => {
      const areas = employeeSelections.get(emp.id);
      return areas && areas.size > 0;
    }).length;
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
    const employeeCount = getEmployeesWithSelections();
    const areasCount = getTotalSelected();
    
    toast({
      title: "Приказ создан",
      description: `${selectedType?.label} №${orderNumber} на ${employeeCount} сотрудников (${areasCount} областей аттестации)`,
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
    setEmployeeSelections(new Map());
    setSearchEmployee('');
    setCategoryFilter('all');
    setStatusFilter('all');
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
      default:
        return 'О выполнении приказа';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
                  После создания приказа вы сможете направить сотрудников в УЦ, СДО, Ростехнадзор или на внутреннюю аттестацию
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
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
                          {type.description}
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
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <Icon name="Info" size={14} className="inline mr-1" />
                  Выберите сотрудников и их области аттестации для включения в приказ. Эти данные будут использованы для формирования приложения к приказу.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по области, категории или ФИО..."
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="valid">Действует</SelectItem>
                    <SelectItem value="expiring_soon">Истекает</SelectItem>
                    <SelectItem value="expired">Просрочен</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Выбрано областей:</span>
                    <span className="ml-2 font-semibold">{getTotalSelected()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Сотрудников:</span>
                    <span className="ml-2 font-semibold">{getEmployeesWithSelections()} из {employees.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    <Icon name="CheckCheck" size={14} className="mr-1" />
                    Выбрать все
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <Icon name="X" size={14} className="mr-1" />
                    Очистить
                  </Button>
                </div>
              </div>

              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-4">
                  {(() => {
                    const employeesGrouped = new Map<string, typeof filteredCertifications>();
                    filteredCertifications.forEach(cert => {
                      const list = employeesGrouped.get(cert.employeeId) || [];
                      list.push(cert);
                      employeesGrouped.set(cert.employeeId, list);
                    });

                    return Array.from(employeesGrouped.entries()).map(([employeeId, certs]) => {
                      const employee = employees.find(e => e.id === employeeId);
                      if (!employee) return null;

                      const allAreaIds = certs.map(c => c.id);
                      const selectedAreas = employeeSelections.get(employeeId) || new Set();
                      const allSelected = selectedAreas.size === allAreaIds.length && allAreaIds.length > 0;

                      return (
                        <Card key={employeeId} className="overflow-hidden">
                          <div className="p-4 bg-muted/50 border-b">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <Checkbox
                                  checked={allSelected}
                                  onCheckedChange={() => toggleEmployee(employeeId, allAreaIds)}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{employee.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {employee.position} • {employee.department}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                {selectedAreas.size} / {certs.length}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4 space-y-2">
                            {certs.map(cert => (
                              <div
                                key={cert.id}
                                className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                                onClick={() => toggleArea(employeeId, cert.id)}
                              >
                                <Checkbox
                                  checked={isAreaSelected(employeeId, cert.id)}
                                  onCheckedChange={() => toggleArea(employeeId, cert.id)}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{cert.area}</div>
                                  <div className="text-xs text-muted-foreground">{cert.category}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <Badge variant="outline" className={`text-xs ${getStatusColor(cert.status)}`}>
                                    {getStatusLabel(cert.status)}
                                  </Badge>
                                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                                    {cert.daysLeft > 0 ? `${cert.daysLeft} дн.` : 'Просрочено'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      );
                    });
                  })()}
                </div>
              </ScrollArea>

              {filteredCertifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Users" size={32} className="mx-auto mb-2" />
                  <p>Сотрудники с областями аттестации не найдены</p>
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
            <Button onClick={handleCreate} disabled={getTotalSelected() === 0}>
              <Icon name="CheckCircle2" size={16} className="mr-2" />
              Создать приказ
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}