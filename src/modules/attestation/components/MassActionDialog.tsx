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
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Certification {
  id: string;
  category: string;
  area: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  daysLeft: number;
  verified?: boolean;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  organization: string;
  certifications: Certification[];
}

interface MassActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: string;
  employees: Employee[];
}

interface EmployeeWithAreas {
  employeeId: string;
  selectedAreas: Set<string>;
}

export default function MassActionDialog({
  open,
  onOpenChange,
  actionType,
  employees,
}: MassActionDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeSelections, setEmployeeSelections] = useState<Map<string, Set<string>>>(new Map());

  const getActionTitle = () => {
    switch (actionType) {
      case 'training':
        return 'Направление на обучение';
      case 'attestation':
        return 'Направление на аттестацию';
      case 'notification':
        return 'Отправка уведомлений';
      default:
        return 'Массовое действие';
    }
  };

  const getActionDescription = () => {
    switch (actionType) {
      case 'training':
        return 'Выберите области аттестации для направления сотрудников на обучение';
      case 'attestation':
        return 'Выберите области аттестации для направления сотрудников на аттестацию';
      case 'notification':
        return 'Выберите области аттестации для отправки уведомлений сотрудникам';
      default:
        return 'Выберите области аттестации для выполнения действия';
    }
  };

  const allCertifications = useMemo(() => {
    const certs: Array<Certification & { employeeId: string; employeeName: string; position: string }> = [];
    employees.forEach(emp => {
      emp.certifications.forEach(cert => {
        certs.push({
          ...cert,
          employeeId: emp.id,
          employeeName: emp.name,
          position: emp.position,
        });
      });
    });
    return certs;
  }, [employees]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(allCertifications.map(c => c.category)));
  }, [allCertifications]);

  const filteredCertifications = useMemo(() => {
    return allCertifications.filter(cert => {
      const matchesSearch =
        cert.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || cert.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allCertifications, searchQuery, categoryFilter, statusFilter]);

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

  const getCertificationKey = (cert: any) => {
    return `${cert.employeeId}-${cert.id}`;
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

  const handleSubmit = () => {
    const result: Array<{ employeeId: string; employeeName: string; areas: string[] }> = [];
    
    employeeSelections.forEach((areas, employeeId) => {
      const employee = employees.find(e => e.id === employeeId);
      if (employee && areas.size > 0) {
        const selectedAreas = employee.certifications
          .filter(cert => areas.has(cert.id))
          .map(cert => cert.area);
        
        result.push({
          employeeId,
          employeeName: employee.name,
          areas: selectedAreas,
        });
      }
    });

    console.log(`Массовое действие "${actionType}":`, result);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setEmployeeSelections(new Map());
    onOpenChange(false);
  };

  const employeesGrouped = useMemo(() => {
    const grouped = new Map<string, typeof filteredCertifications>();
    filteredCertifications.forEach(cert => {
      const list = grouped.get(cert.employeeId) || [];
      list.push(cert);
      grouped.set(cert.employeeId, list);
    });
    return grouped;
  }, [filteredCertifications]);

  const totalSelected = getTotalSelected();
  const employeesSelected = getEmployeesWithSelections();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Users" size={20} />
            {getActionTitle()}
          </DialogTitle>
          <DialogDescription>
            {getActionDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по области, категории или ФИО..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[250px]">
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
              <SelectTrigger className="w-full sm:w-[180px]">
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
                <span className="ml-2 font-semibold">{totalSelected}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Сотрудников:</span>
                <span className="ml-2 font-semibold">{employeesSelected} из {employees.length}</span>
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

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {Array.from(employeesGrouped.entries()).map(([employeeId, certs]) => {
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
                            <div className="text-xs text-muted-foreground mt-1">
                              {employee.organization}
                            </div>
                          </div>
                        </div>
                        {selectedAreas.size > 0 && (
                          <Badge variant="secondary">
                            Выбрано: {selectedAreas.size} из {certs.length}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="divide-y">
                      {certs.map((cert) => {
                        const isSelected = isAreaSelected(employeeId, cert.id);
                        const isExpiring = cert.status === 'expiring_soon';
                        const isExpired = cert.status === 'expired';
                        
                        return (
                          <div
                            key={cert.id}
                            className={`p-3 hover:bg-muted/30 cursor-pointer transition-colors ${
                              isSelected ? 'bg-primary/5' : ''
                            } ${isExpiring ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''} ${
                              isExpired ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                            }`}
                            onClick={() => toggleArea(employeeId, cert.id)}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleArea(employeeId, cert.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2 mb-1">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{cert.area}</div>
                                    <div className="text-xs text-muted-foreground">{cert.category}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                                  <span className="flex items-center gap-1">
                                    <Icon name="Calendar" size={12} />
                                    Срок до {new Date(cert.expiryDate).toLocaleDateString('ru')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Icon name="Clock" size={12} />
                                    Осталось {cert.daysLeft} дн.
                                  </span>
                                  {cert.verified && (
                                    <span className="flex items-center gap-1 text-emerald-600">
                                      <Icon name="CheckCircle2" size={12} />
                                      Верифицирован
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge className={getStatusColor(cert.status)}>
                                  {getStatusLabel(cert.status)}
                                </Badge>
                                {(isExpiring || isExpired) && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Icon 
                                      name="AlertTriangle" 
                                      size={12} 
                                      className={isExpired ? 'text-red-600' : 'text-amber-600'} 
                                    />
                                    <span className={isExpired ? 'text-red-600' : 'text-amber-600'}>
                                      {isExpired ? 'Требуется аттестация' : 'Скоро истекает'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>

            {employeesGrouped.size === 0 && (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Ничего не найдено</p>
                <p className="text-sm text-muted-foreground">Измените параметры поиска</p>
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отменить
          </Button>
          <Button onClick={handleSubmit} disabled={totalSelected === 0}>
            <Icon name="CheckCircle2" size={16} className="mr-2" />
            Применить ({totalSelected} {totalSelected === 1 ? 'область' : totalSelected < 5 ? 'области' : 'областей'})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
