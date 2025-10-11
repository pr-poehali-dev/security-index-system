import { useState, useMemo } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAttestationStore } from '@/stores/attestationStore';
import { getPersonnelFullInfo, getCertificationStatus } from '@/lib/personnelUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import ImportCertificationsDialog from '../certifications/ImportCertificationsDialog';
import AddCertificationDialog from '../certifications/AddCertificationDialog';
import MassActionDialog from '../orders/MassActionDialog';
import ExportReportDialog from '../certifications/ExportReportDialog';
import AddEmployeeDialog from './AddEmployeeDialog';
import EmployeeStatisticsCards from './EmployeeStatisticsCards';
import EmployeeFilters from './EmployeeFilters';
import EmployeeCardItem from './EmployeeCardItem';
import EmployeeTableRow from './EmployeeTableRow';
import EmployeeDetailsDialog from './EmployeeDetailsDialog';
import type { Employee } from '../../utils/employeeUtils';

interface EmployeeAttestationsTabProps {
  onAddEmployee?: () => void;
}

export default function EmployeeAttestationsTab({ onAddEmployee }: EmployeeAttestationsTabProps) {
  const { personnel, people, positions, organizations } = useSettingsStore();
  const { certifications, updateCertification } = useAttestationStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAddCertDialog, setShowAddCertDialog] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  const [showMassActionDialog, setShowMassActionDialog] = useState(false);
  const [massActionType, setMassActionType] = useState<string>('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);

  const mockEmployees = useMemo(() => {
    return personnel
      .filter(p => p.personnelType === 'employee')
      .map(p => {
        const info = getPersonnelFullInfo(p, people, positions);
        const org = organizations.find(o => o.id === p.organizationId);
        const personnelCerts = certifications.filter(c => c.personnelId === p.id);

        return {
          id: p.id,
          name: info.fullName,
          position: info.position,
          department: '—',
          organization: org?.name || '—',
          certifications: personnelCerts.map(cert => {
          const { status, daysLeft } = getCertificationStatus(cert.expiryDate);
          const categoryMap: Record<string, string> = {
            industrial_safety: 'Промышленная безопасность',
            energy_safety: 'Энергобезопасность',
            labor_safety: 'Охрана труда',
            ecology: 'Экология'
          };
          return {
            id: cert.id,
            category: categoryMap[cert.category] || cert.category,
            area: cert.area,
            issueDate: cert.issueDate,
            expiryDate: cert.expiryDate,
            protocolNumber: cert.protocolNumber,
            protocolDate: cert.protocolDate,
            verified: cert.verified,
            verifiedDate: cert.verifiedDate,
            status,
            daysLeft
          };
        })
      };
    });
  }, [personnel, people, positions, organizations, certifications]);

  const handleVerificationToggle = (certId: string) => {
    const cert = certifications.find(c => c.id === certId);
    if (!cert) return;
    
    updateCertification(certId, {
      verified: !cert.verified,
      verifiedDate: !cert.verified ? new Date().toISOString() : undefined,
      verifiedBy: !cert.verified ? 'Текущий пользователь' : undefined
    });
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployeeIds);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployeeIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployeeIds(new Set(filteredEmployees.map(emp => emp.id)));
    } else {
      setSelectedEmployeeIds(new Set());
    }
  };

  const handleCreateOrder = (type: string) => {
    setMassActionType(type);
    setShowMassActionDialog(true);
  };

  const handleExportToExcel = async () => {
    const { utils, writeFile } = await import('xlsx');
    
    const employeesToExport = selectedEmployeeIds.size > 0 
      ? mockEmployees.filter(emp => selectedEmployeeIds.has(emp.id))
      : filteredEmployees;

    const exportData = employeesToExport.flatMap(emp => 
      emp.certifications.map(cert => ({
        'ФИО': emp.name,
        'Должность': emp.position,
        'Подразделение': emp.department,
        'Организация': emp.organization,
        'Категория аттестации': cert.category,
        'Область аттестации': cert.area,
        'Дата выдачи': new Date(cert.issueDate).toLocaleDateString('ru'),
        'Срок действия до': new Date(cert.expiryDate).toLocaleDateString('ru'),
        'Осталось дней': cert.daysLeft,
        'Статус': cert.status === 'valid' ? 'Действует' : cert.status === 'expiring_soon' ? 'Истекает' : 'Просрочен',
        'Номер протокола': cert.protocolNumber || '',
        'Дата протокола': cert.protocolDate ? new Date(cert.protocolDate).toLocaleDateString('ru') : '',
        'Верифицирован': cert.verified ? 'Да' : 'Нет',
        'Дата верификации': cert.verifiedDate ? new Date(cert.verifiedDate).toLocaleDateString('ru') : ''
      }))
    );

    const ws = utils.json_to_sheet(exportData);
    
    const colWidths = [
      { wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 35 }, { wch: 25 }, { wch: 40 },
      { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }
    ];
    ws['!cols'] = colWidths;

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Сотрудники и аттестации');

    const fileName = selectedEmployeeIds.size > 0 
      ? `Сотрудники_выбранные_${new Date().toLocaleDateString('ru')}.xlsx`
      : `Сотрудники_все_${new Date().toLocaleDateString('ru')}.xlsx`;
    
    writeFile(wb, fileName);
  };

  const selectedEmployees = useMemo(() => {
    return mockEmployees.filter(emp => selectedEmployeeIds.has(emp.id));
  }, [selectedEmployeeIds, mockEmployees]);

  const uniqueOrganizations = useMemo(() => {
    return Array.from(new Set(mockEmployees.map(emp => emp.organization)));
  }, [mockEmployees]);

  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.organization.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesOrganization = organizationFilter === 'all' || emp.organization === organizationFilter;
    
    const matchesStatus = statusFilter === 'all' || emp.certifications.some(cert => cert.status === statusFilter);
    
    const matchesVerification = verificationFilter === 'all' || (() => {
      const verifiableCerts = emp.certifications.filter(cert => 
        cert.protocolNumber && (cert.category === 'Промышленная безопасность' || cert.category === 'Энергобезопасность')
      );
      
      if (verifiableCerts.length === 0) return verificationFilter === 'all';
      
      if (verificationFilter === 'verified') {
        return verifiableCerts.some(cert => cert.verified === true);
      } else if (verificationFilter === 'unverified') {
        return verifiableCerts.some(cert => !cert.verified);
      }
      return true;
    })();
    
    return matchesSearch && matchesOrganization && matchesStatus && matchesVerification;
  });

  const totalCertifications = mockEmployees.reduce((sum, emp) => sum + emp.certifications.length, 0);
  const validCertifications = mockEmployees.reduce((sum, emp) => 
    sum + emp.certifications.filter(c => c.status === 'valid').length, 0);
  const expiringCertifications = mockEmployees.reduce((sum, emp) => 
    sum + emp.certifications.filter(c => c.status === 'expiring_soon').length, 0);
  const expiredCertifications = mockEmployees.reduce((sum, emp) => 
    sum + emp.certifications.filter(c => c.status === 'expired').length, 0);

  return (
    <div className="space-y-6">
      <EmployeeStatisticsCards
        totalCertifications={totalCertifications}
        validCertifications={validCertifications}
        expiringCertifications={expiringCertifications}
        expiredCertifications={expiredCertifications}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Реестр сотрудников и аттестаций</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="gap-2"
              >
                <Icon name="LayoutGrid" size={16} />
                Карточки
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="gap-2"
              >
                <Icon name="Table" size={16} />
                Таблица
              </Button>
              
              {selectedEmployeeIds.size > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="gap-2">
                      <Icon name="FileText" size={18} />
                      Сформировать приказ ({selectedEmployeeIds.size})
                      <Icon name="ChevronDown" size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[320px]">
                    <DropdownMenuItem onClick={() => handleCreateOrder('sdo')}>
                      <Icon name="Monitor" size={16} className="mr-2" />
                      О подготовке в СДО Интеллектуальная система
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCreateOrder('training_center')}>
                      <Icon name="School" size={16} className="mr-2" />
                      О подготовке в учебный центр
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCreateOrder('internal_attestation')}>
                      <Icon name="ClipboardCheck" size={16} className="mr-2" />
                      О аттестации в ЕПТ организации
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCreateOrder('rostechnadzor')}>
                      <Icon name="Building2" size={16} className="mr-2" />
                      О направлении на аттестацию в Ростехнадзор
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2">
                    <Icon name="Plus" size={18} />
                    Добавить
                    <Icon name="ChevronDown" size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowAddEmployeeDialog(true)}>
                    <Icon name="UserPlus" size={16} className="mr-2" />
                    Добавить сотрудника
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                    <Icon name="Upload" size={16} className="mr-2" />
                    Импорт из Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
                    <Icon name="FileDown" size={16} className="mr-2" />
                    Экспорт отчёта
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <EmployeeFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              organizationFilter={organizationFilter}
              setOrganizationFilter={setOrganizationFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              verificationFilter={verificationFilter}
              setVerificationFilter={setVerificationFilter}
              uniqueOrganizations={uniqueOrganizations}
            />
          </div>

          {selectedEmployeeIds.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedEmployeeIds.size === filteredEmployees.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    Выбрано сотрудников: {selectedEmployeeIds.size}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportToExcel}
                    className="gap-2"
                  >
                    <Icon name="Download" size={14} />
                    Экспорт в Excel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEmployeeIds(new Set())}
                    className="gap-2"
                  >
                    <Icon name="X" size={14} />
                    Отменить выбор
                  </Button>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'cards' ? (
            <div className="space-y-4">
              {filteredEmployees.map((emp) => (
                <EmployeeCardItem
                  key={emp.id}
                  employee={emp}
                  isSelected={selectedEmployeeIds.has(emp.id)}
                  onSelect={(checked) => handleSelectEmployee(emp.id, checked)}
                  onViewDetails={() => setSelectedEmployee(emp)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-medium w-12">
                      <Checkbox
                        checked={selectedEmployeeIds.size === filteredEmployees.length && filteredEmployees.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="pb-3 font-medium">ФИО</th>
                    <th className="pb-3 font-medium">Организация</th>
                    <th className="pb-3 font-medium">Должность</th>
                    <th className="pb-3 font-medium">Подразделение</th>
                    <th className="pb-3 font-medium">Аттестаций</th>
                    <th className="pb-3 font-medium">Статус</th>
                    <th className="pb-3 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <EmployeeTableRow
                      key={emp.id}
                      employee={emp}
                      isSelected={selectedEmployeeIds.has(emp.id)}
                      onSelect={(checked) => handleSelectEmployee(emp.id, checked)}
                      onViewDetails={() => setSelectedEmployee(emp)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Сотрудники не найдены
            </div>
          )}
        </CardContent>
      </Card>

      <EmployeeDetailsDialog
        employee={selectedEmployee}
        open={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onVerificationToggle={handleVerificationToggle}
        onShowExportDialog={() => setShowExportDialog(true)}
        onShowAddCertDialog={() => setShowAddCertDialog(true)}
      />

      <ImportCertificationsDialog 
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />

      <AddCertificationDialog 
        open={showAddCertDialog}
        onOpenChange={setShowAddCertDialog}
        employeeName={selectedEmployee?.name}
      />

      <MassActionDialog
        open={showMassActionDialog}
        onOpenChange={setShowMassActionDialog}
        actionType={massActionType}
        employees={selectedEmployees}
      />

      <ExportReportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        employees={mockEmployees}
      />

      <AddEmployeeDialog
        open={showAddEmployeeDialog}
        onOpenChange={setShowAddEmployeeDialog}
      />
    </div>
  );
}
