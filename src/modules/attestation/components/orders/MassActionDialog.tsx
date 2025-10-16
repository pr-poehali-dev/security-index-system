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
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import UnifiedDocumentDialog from '../UnifiedDocumentDialog';
import MassActionFilters from './mass-action/MassActionFilters';
import MassActionSelectionBar from './mass-action/MassActionSelectionBar';
import EmployeeList from './mass-action/EmployeeList';
import { getCertificationStatusLabel, getCertificationStatusColor } from '@/modules/attestation/utils/statusHelpers';

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

interface SelectedCertification {
  personnelId: string;
  certificationId: string;
  category: string;
  area: string;
}

const getActionTitle = (actionType: string) => {
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

const getActionDescription = (actionType: string) => {
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



export default function MassActionDialog({
  open,
  onOpenChange,
  actionType,
  employees,
}: MassActionDialogProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeSelections, setEmployeeSelections] = useState<Map<string, Set<string>>>(new Map());
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [preselectedData, setPreselectedData] = useState<{
    employeeIds: string[];
    certifications: SelectedCertification[];
  } | null>(null);

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
    return Array.from(new Set(allCertifications.map(c => c.category))).filter(cat => cat && cat.trim() !== '');
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
    const selectedEmployeeIds: string[] = [];
    const orderCertifications: SelectedCertification[] = [];
    
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

    if (selectedEmployeeIds.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите сотрудников и области аттестации',
        variant: 'destructive'
      });
      return;
    }

    setPreselectedData({
      employeeIds: selectedEmployeeIds,
      certifications: orderCertifications
    });
    setShowOrderDialog(true);
  };

  const handleClose = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setEmployeeSelections(new Map());
    onOpenChange(false);
  };

  const handleOrderCreated = () => {
    setShowOrderDialog(false);
    handleClose();
    toast({
      title: 'Приказ создан',
      description: `Сотрудников: ${preselectedData?.employeeIds.length || 0}, областей: ${preselectedData?.certifications.length || 0}`,
    });
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
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              {getActionTitle(actionType)}
            </DialogTitle>
            <DialogDescription>
              {getActionDescription(actionType)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <MassActionFilters
              searchQuery={searchQuery}
              categoryFilter={categoryFilter}
              statusFilter={statusFilter}
              uniqueCategories={uniqueCategories}
              onSearchChange={setSearchQuery}
              onCategoryFilterChange={setCategoryFilter}
              onStatusFilterChange={setStatusFilter}
            />

            <MassActionSelectionBar
              totalSelected={totalSelected}
              employeesSelected={employeesSelected}
              totalEmployees={employees.length}
              onSelectAll={selectAll}
              onClearAll={clearAll}
            />

            <EmployeeList
              employeesGrouped={employeesGrouped}
              employees={employees}
              employeeSelections={employeeSelections}
              onToggleEmployee={toggleEmployee}
              onToggleArea={toggleArea}
              isAreaSelected={isAreaSelected}
              getStatusColor={getCertificationStatusColor}
              getStatusLabel={getCertificationStatusLabel}
            />
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

      <UnifiedDocumentDialog
        open={showOrderDialog}
        onOpenChange={setShowOrderDialog}
        documentType="order"
      />
    </>
  );
}