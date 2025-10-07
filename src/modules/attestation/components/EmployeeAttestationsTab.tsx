import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import ImportCertificationsDialog from './ImportCertificationsDialog';
import AddCertificationDialog from './AddCertificationDialog';
import MassActionDialog from './MassActionDialog';
import ExportReportDialog from './ExportReportDialog';

interface Certification {
  id: string;
  category: string;
  area: string;
  issueDate: string;
  expiryDate: string;
  protocolNumber?: string;
  protocolDate?: string;
  verified?: boolean;
  verifiedDate?: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  daysLeft: number;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  organization: string;
  certifications: Certification[];
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Иванов Иван Иванович',
    position: 'Инженер',
    department: 'Производство',
    organization: 'ООО "ПромСтройИнжиниринг"',
    certifications: [
      {
        id: '1-1',
        category: 'Промышленная безопасность',
        area: 'А.1 Основы промышленной безопасности',
        issueDate: '2023-01-01',
        expiryDate: '2028-01-01',
        protocolNumber: 'ПБ-123/2023',
        protocolDate: '2023-01-01',
        verified: true,
        verifiedDate: '2024-03-15',
        status: 'valid',
        daysLeft: 1182
      },
      {
        id: '1-2',
        category: 'Промышленная безопасность',
        area: 'Б.3 Эксплуатация объектов электроэнергетики',
        issueDate: '2021-09-15',
        expiryDate: '2026-09-14',
        protocolNumber: 'ПБ-456/2021',
        protocolDate: '2021-09-15',
        verified: false,
        status: 'valid',
        daysLeft: 342
      },
      {
        id: '1-3',
        category: 'Энергобезопасность',
        area: 'Электропотребители промышленные 5 группа до и выше 1000В',
        issueDate: '2025-02-17',
        expiryDate: '2026-02-17',
        protocolNumber: 'ЭБ-789/2025',
        protocolDate: '2025-02-17',
        verified: false,
        status: 'valid',
        daysLeft: 133
      }
    ]
  },
  {
    id: '2',
    name: 'Петрова Анна Сергеевна',
    position: 'Начальник участка',
    department: 'Производство',
    organization: 'ООО "ПромСтройИнжиниринг"',
    certifications: [
      {
        id: '2-1',
        category: 'Промышленная безопасность',
        area: 'А.1 Основы промышленной безопасности',
        issueDate: '2020-03-10',
        expiryDate: '2025-03-10',
        protocolNumber: 'ПБ-234/2020',
        protocolDate: '2020-03-10',
        verified: true,
        verifiedDate: '2020-03-15',
        status: 'expired',
        daysLeft: -211
      },
      {
        id: '2-2',
        category: 'Электробезопасность',
        area: 'V группа до 1000В',
        issueDate: '2024-06-15',
        expiryDate: '2025-06-15',
        status: 'expiring_soon',
        daysLeft: 251
      }
    ]
  },
  {
    id: '3',
    name: 'Сидоров Петр Николаевич',
    position: 'Электромонтер',
    department: 'Энергетика',
    organization: 'АО "ЭнергоСервис"',
    certifications: [
      {
        id: '3-1',
        category: 'Электробезопасность',
        area: 'III группа до 1000В',
        issueDate: '2023-05-20',
        expiryDate: '2025-11-20',
        status: 'expiring_soon',
        daysLeft: 44
      },
      {
        id: '3-2',
        category: 'Работы на высоте',
        area: '2 группа без применения средств подмащивания',
        issueDate: '2022-08-01',
        expiryDate: '2025-08-01',
        status: 'expired',
        daysLeft: -67
      }
    ]
  }
];

interface EmployeeAttestationsTabProps {
  onAddEmployee?: () => void;
}

export default function EmployeeAttestationsTab({ onAddEmployee }: EmployeeAttestationsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAddCertDialog, setShowAddCertDialog] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderType, setOrderType] = useState<string>('');
  const [showMassActionDialog, setShowMassActionDialog] = useState(false);
  const [massActionType, setMassActionType] = useState<string>('');
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleVerificationToggle = (certId: string) => {
    if (!selectedEmployee) return;
    
    const updatedEmployee = {
      ...selectedEmployee,
      certifications: selectedEmployee.certifications.map(cert => {
        if (cert.id === certId) {
          return {
            ...cert,
            verified: !cert.verified,
            verifiedDate: !cert.verified ? new Date().toISOString().split('T')[0] : undefined
          };
        }
        return cert;
      })
    };
    
    setSelectedEmployee(updatedEmployee);
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
      { wch: 30 }, // ФИО
      { wch: 25 }, // Должность
      { wch: 20 }, // Подразделение
      { wch: 35 }, // Организация
      { wch: 25 }, // Категория
      { wch: 40 }, // Область
      { wch: 12 }, // Дата выдачи
      { wch: 15 }, // Срок действия
      { wch: 12 }, // Осталось дней
      { wch: 12 }, // Статус
      { wch: 18 }, // Номер протокола
      { wch: 15 }, // Дата протокола
      { wch: 15 }, // Верифицирован
      { wch: 15 }  // Дата верификации
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
  }, [selectedEmployeeIds]);

  const uniqueOrganizations = Array.from(new Set(mockEmployees.map(emp => emp.organization)));

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

  const getEmployeeStatus = (employee: Employee): 'valid' | 'expiring_soon' | 'expired' => {
    const hasExpired = employee.certifications.some(c => c.status === 'expired');
    if (hasExpired) return 'expired';
    
    const hasExpiring = employee.certifications.some(c => c.status === 'expiring_soon');
    if (hasExpiring) return 'expiring_soon';
    
    return 'valid';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
      case 'expiring_soon': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      case 'expired': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'valid': return 'Действующие';
      case 'expiring_soon': return 'Истекают';
      case 'expired': return 'Просрочены';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return 'CheckCircle2';
      case 'expiring_soon': return 'AlertTriangle';
      case 'expired': return 'XCircle';
      default: return 'Circle';
    }
  };

  const totalCertifications = mockEmployees.reduce((sum, emp) => sum + emp.certifications.length, 0);
  const validCertifications = mockEmployees.reduce((sum, emp) => 
    sum + emp.certifications.filter(c => c.status === 'valid').length, 0);
  const expiringCertifications = mockEmployees.reduce((sum, emp) => 
    sum + emp.certifications.filter(c => c.status === 'expiring_soon').length, 0);
  const expiredCertifications = mockEmployees.reduce((sum, emp) => 
    sum + emp.certifications.filter(c => c.status === 'expired').length, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Award" className="text-blue-600" size={24} />
              <span className="text-2xl font-bold">{totalCertifications}</span>
            </div>
            <p className="text-sm text-muted-foreground">Всего аттестаций</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
              <span className="text-2xl font-bold">{validCertifications}</span>
            </div>
            <p className="text-sm text-muted-foreground">Действующие допуски</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="AlertTriangle" className="text-amber-600" size={24} />
              <span className="text-2xl font-bold">{expiringCertifications}</span>
            </div>
            <p className="text-sm text-muted-foreground">Истекают (30 дней)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="XCircle" className="text-red-600" size={24} />
              <span className="text-2xl font-bold">{expiredCertifications}</span>
            </div>
            <p className="text-sm text-muted-foreground">Просрочено</p>
          </CardContent>
        </Card>
      </div>

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
                  <DropdownMenuItem onClick={onAddEmployee}>
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
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск по ФИО, должности или организации..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Организация" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Icon name="Building2" size={14} />
                      Все организации
                    </div>
                  </SelectItem>
                  {uniqueOrganizations.map((org) => (
                    <SelectItem key={org} value={org}>
                      <div className="flex items-center gap-2">
                        <Icon name="Building2" size={14} />
                        {org}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Статус аттестации" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="valid">Действующие</SelectItem>
                  <SelectItem value="expiring_soon">Истекают</SelectItem>
                  <SelectItem value="expired">Просрочены</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Статус проверки" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      Все проверки
                    </div>
                  </SelectItem>
                  <SelectItem value="verified">
                    <div className="flex items-center gap-2">
                      <Icon name="CheckCircle2" size={14} className="text-emerald-600" />
                      Проверенные
                    </div>
                  </SelectItem>
                  <SelectItem value="unverified">
                    <div className="flex items-center gap-2">
                      <Icon name="AlertCircle" size={14} className="text-amber-600" />
                      Непроверенные
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              {filteredEmployees.map((emp) => {
                const status = getEmployeeStatus(emp);
                const isSelected = selectedEmployeeIds.has(emp.id);
                return (
                  <Card key={emp.id} className={`hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectEmployee(emp.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{emp.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              <Icon name={getStatusIcon(status) as any} size={12} className="inline mr-1" />
                              {getStatusLabel(status)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <Icon name="Building2" size={14} className="inline mr-1" />
                            {emp.organization}
                          </p>
                          <p className="text-sm text-muted-foreground">{emp.position} • {emp.department}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Аттестаций: {emp.certifications.length}
                          </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedEmployee(emp)}
                            className="gap-2"
                          >
                            <Icon name="Eye" size={14} />
                            Подробнее
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon name="Edit" size={16} />
                          </Button>
                        </div>
                      </div>

                      <div className="pt-3 border-t space-y-2">
                        {emp.certifications.slice(0, 2).map((cert) => (
                          <div key={cert.id} className="flex items-start justify-between text-sm">
                            <div className="flex-1">
                              <p className="font-medium">{cert.category}</p>
                              <p className="text-muted-foreground text-xs">{cert.area}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xs font-medium ${
                                cert.status === 'valid' ? 'text-emerald-600' :
                                cert.status === 'expiring_soon' ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                до {new Date(cert.expiryDate).toLocaleDateString('ru')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {cert.daysLeft > 0 ? `${cert.daysLeft} дн.` : 'Просрочено'}
                              </p>
                            </div>
                          </div>
                        ))}
                        {emp.certifications.length > 2 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-xs"
                            onClick={() => setSelectedEmployee(emp)}
                          >
                            Показать все ({emp.certifications.length})
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
                  {filteredEmployees.map((emp) => {
                    const status = getEmployeeStatus(emp);
                    const isSelected = selectedEmployeeIds.has(emp.id);
                    return (
                      <tr key={emp.id} className={`border-b last:border-0 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <td className="py-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectEmployee(emp.id, checked as boolean)}
                          />
                        </td>
                        <td className="py-3 font-medium">{emp.name}</td>
                        <td className="py-3 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Icon name="Building2" size={14} />
                            {emp.organization}
                          </div>
                        </td>
                        <td className="py-3 text-muted-foreground">{emp.position}</td>
                        <td className="py-3 text-muted-foreground">{emp.department}</td>
                        <td className="py-3">{emp.certifications.length}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            <Icon name={getStatusIcon(status) as any} size={12} />
                            {getStatusLabel(status)}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedEmployee(emp)}
                            >
                              <Icon name="Eye" size={16} />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Icon name="Edit" size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Аттестации сотрудника</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="pb-4 border-b">
                <h3 className="font-semibold text-lg">{selectedEmployee.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  <Icon name="Building2" size={14} className="inline mr-1" />
                  {selectedEmployee.organization}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedEmployee.position} • {selectedEmployee.department}
                </p>
              </div>

              <div className="space-y-3">
                {selectedEmployee.certifications.map((cert) => (
                  <Card key={cert.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-semibold">{cert.category}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                              <Icon name={getStatusIcon(cert.status) as any} size={12} className="inline mr-1" />
                              {getStatusLabel(cert.status)}
                            </span>
                            {cert.verified && cert.protocolNumber && (cert.category === 'Промышленная безопасность' || cert.category === 'Энергобезопасность') && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <Icon name="CheckCircle2" size={12} className="inline mr-1" />
                                Проверено
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{cert.area}</p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Дата аттестации:</p>
                              <p className="font-medium">{new Date(cert.issueDate).toLocaleDateString('ru')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Действителен до:</p>
                              <p className={`font-medium ${
                                cert.status === 'valid' ? 'text-emerald-600' :
                                cert.status === 'expiring_soon' ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {new Date(cert.expiryDate).toLocaleDateString('ru')}
                              </p>
                            </div>
                            {cert.protocolNumber && (
                              <>
                                <div>
                                  <p className="text-muted-foreground">Номер протокола:</p>
                                  <p className="font-medium">{cert.protocolNumber}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Дата протокола:</p>
                                  <p className="font-medium">{cert.protocolDate ? new Date(cert.protocolDate).toLocaleDateString('ru') : '—'}</p>
                                </div>
                              </>
                            )}
                          </div>
                          {cert.daysLeft > 0 ? (
                            <p className="text-sm text-muted-foreground mt-2">
                              Осталось: {cert.daysLeft} дней
                            </p>
                          ) : (
                            <p className="text-sm text-red-600 font-medium mt-2">
                              Просрочено на {Math.abs(cert.daysLeft)} дней
                            </p>
                          )}
                          
                          {cert.protocolNumber && (cert.category === 'Промышленная безопасность' || cert.category === 'Энергобезопасность') && (
                            <div className="space-y-3 mt-3 pt-3 border-t">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => {
                                    navigator.clipboard.writeText(cert.protocolNumber || '');
                                    alert('Номер протокола скопирован');
                                  }}
                                >
                                  <Icon name="Copy" size={14} />
                                  Скопировать номер протокола
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => window.open('https://qr.gosnadzor.ru/prombez', '_blank')}
                                >
                                  <Icon name="ExternalLink" size={14} />
                                  Проверить в Ростехнадзоре
                                </Button>
                              </div>
                              
                              <div className={`flex items-center justify-between p-3 rounded-lg ${
                                cert.verified 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900' 
                                  : 'bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900'
                              }`}>
                                <div className="flex items-center gap-3">
                                  <Icon 
                                    name={cert.verified ? "CheckCircle2" : "AlertCircle"} 
                                    size={20} 
                                    className={cert.verified ? "text-emerald-600" : "text-slate-400"}
                                  />
                                  <div>
                                    <Label htmlFor={`verify-${cert.id}`} className="text-sm font-medium cursor-pointer">
                                      {cert.verified ? 'Проверено в реестре Ростехнадзора' : 'Не проверено в реестре'}
                                    </Label>
                                    {cert.verified && cert.verifiedDate && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        Проверено: {new Date(cert.verifiedDate).toLocaleDateString('ru')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Switch 
                                  id={`verify-${cert.id}`}
                                  checked={cert.verified || false}
                                  onCheckedChange={() => handleVerificationToggle(cert.id)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon name="FileText" size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="pt-4 border-t flex items-center justify-end gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setShowExportDialog(true)}
                >
                  <Icon name="Download" size={16} />
                  Экспорт отчёта
                </Button>
                <Button 
                  className="gap-2"
                  onClick={() => setShowAddCertDialog(true)}
                >
                  <Icon name="Plus" size={16} />
                  Добавить аттестацию
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
    </div>
  );
}