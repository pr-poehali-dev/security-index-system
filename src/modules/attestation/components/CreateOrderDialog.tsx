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
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCertificationStore } from '@/stores/certificationStore';
import { useOrdersStore } from '@/stores/ordersStore';
import { getPersonnelFullInfo, getCertificationStatus } from '@/lib/utils/personnelUtils';
import OrderTypeSelector from './create-order/OrderTypeSelector';
import OrderBasicInfoForm from './create-order/OrderBasicInfoForm';
import EmployeeSelectionStep from './create-order/EmployeeSelectionStep';
import { getCertificationStatusLabel, getCertificationStatusColor } from '@/modules/attestation/utils/statusHelpers';

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



export default function CreateOrderDialog({ open, onOpenChange, initialOrderType }: CreateOrderDialogProps) {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const allPersonnel = useSettingsStore((state) => state.personnel);
  const people = useSettingsStore((state) => state.people);
  const positions = useSettingsStore((state) => state.positions);
  const deptList = useSettingsStore((state) => state.departments);
  const { certifications } = useCertificationStore();
  const addOrder = useOrdersStore((state) => state.addOrder);
  
  const tenantPersonnel = useMemo(() => 
    user?.tenantId ? allPersonnel.filter(p => p.tenantId === user.tenantId) : []
  , [allPersonnel, user?.tenantId]);
  
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
    if (!user?.tenantId) return;

    const selectedType = orderTypes.find(t => t.value === orderType);
    const employeeCount = getEmployeesWithSelections();
    const areasCount = getTotalSelected();
    
    const selectedEmployeeIds: string[] = [];
    const orderCertifications: Array<{ personnelId: string; certificationId: string; category: string; area: string }> = [];
    
    employeeSelections.forEach((areas, employeeId) => {
      const employee = employees.find(e => e.id === employeeId);
      if (employee && areas.size > 0) {
        selectedEmployeeIds.push(employeeId);
        
        employee.certifications
          .filter(cert => areas.has(cert.id))
          .forEach(cert => {
            orderCertifications.push({
              personnelId: employeeId,
              certificationId: cert.id,
              category: cert.category,
              area: cert.area
            });
          });
      }
    });

    addOrder({
      tenantId: user.tenantId,
      number: orderNumber,
      date: orderDate,
      type: orderType as 'attestation' | 'training' | 'suspension',
      title: orderTitle,
      employeeIds: selectedEmployeeIds,
      certifications: orderCertifications,
      status: 'draft',
      createdBy: user.name || 'Пользователь',
      description: orderDescription || `Областей аттестации: ${orderCertifications.length}, сотрудников: ${selectedEmployeeIds.length}`
    });
    
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

  const handleSelectType = (type: string) => {
    setOrderType(type);
    setOrderTitle(getDefaultTitle(type));
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
            <OrderTypeSelector
              orderTypes={orderTypes}
              selectedType={orderType}
              onSelectType={handleSelectType}
            />
          )}

          {step === 2 && (
            <OrderBasicInfoForm
              selectedType={selectedType}
              orderNumber={orderNumber}
              orderDate={orderDate}
              orderTitle={orderTitle}
              orderDescription={orderDescription}
              onOrderNumberChange={setOrderNumber}
              onOrderDateChange={setOrderDate}
              onOrderTitleChange={setOrderTitle}
              onOrderDescriptionChange={setOrderDescription}
            />
          )}

          {step === 3 && (
            <EmployeeSelectionStep
              searchEmployee={searchEmployee}
              categoryFilter={categoryFilter}
              statusFilter={statusFilter}
              uniqueCategories={uniqueCategories}
              filteredCertifications={filteredCertifications}
              employees={employees}
              employeeSelections={employeeSelections}
              onSearchChange={setSearchEmployee}
              onCategoryFilterChange={setCategoryFilter}
              onStatusFilterChange={setStatusFilter}
              onSelectAll={selectAll}
              onClearAll={clearAll}
              onToggleEmployee={toggleEmployee}
              onToggleArea={toggleArea}
              isAreaSelected={isAreaSelected}
              getTotalSelected={getTotalSelected}
              getEmployeesWithSelections={getEmployeesWithSelections}
              getStatusColor={getCertificationStatusColor}
              getStatusLabel={getCertificationStatusLabel}
            />
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