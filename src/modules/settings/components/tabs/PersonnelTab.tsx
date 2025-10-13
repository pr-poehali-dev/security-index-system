import { useRef, useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { ViewModeToggle } from '@/components/ui/view-mode-toggle';
import { exportPersonnelToExcel, importPersonnelFromExcel } from '@/lib/exportUtils';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';
import type { Personnel, PersonnelType } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PersonnelTabProps {
  onAdd: () => void;
  onEdit: (person: Personnel) => void;
  onDelete: (id: string) => void;
}

export default function PersonnelTab({ onAdd, onEdit, onDelete }: PersonnelTabProps) {
  const user = useAuthStore((state) => state.user);
  const {
    organizations,
    externalOrganizations,
    people,
    positions,
    getDepartmentsByTenant,
    getPersonnelByTenant,
    getOrganizationsByTenant,
    importPersonnel,
    getCertificationsByPerson,
    competenciesDirectory
  } = useSettingsStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    const saved = localStorage.getItem('personnel-view-mode');
    return (saved as 'table' | 'cards') || 'table';
  });

  const handleViewModeChange = (mode: 'table' | 'cards') => {
    setViewMode(mode);
    localStorage.setItem('personnel-view-mode', mode);
  };

  const tenantDepts = getDepartmentsByTenant(user!.tenantId!);
  const tenantPersonnel = getPersonnelByTenant(user!.tenantId!);
  const tenantOrgs = getOrganizationsByTenant(user!.tenantId!);

  const personnelWithInfo = useMemo(() => {
    return tenantPersonnel.map(personnel => {
      const info = getPersonnelFullInfo(personnel, people, positions);
      const person = people.find(p => p.id === personnel.personId);
      return {
        ...personnel,
        fullName: info.fullName,
        positionName: info.position,
        email: person?.email,
        phone: person?.phone
      };
    });
  }, [tenantPersonnel, people, positions]);

  const filteredPersonnel = personnelWithInfo.filter((person) => {
    const matchesSearch = 
      person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.phone?.includes(searchTerm);

    const matchesOrg = filterOrg === 'all' || person.organizationId === filterOrg;
    const matchesStatus = filterStatus === 'all' || person.status === filterStatus;
    const matchesType = filterType === 'all' || person.personnelType === filterType;

    return matchesSearch && matchesOrg && matchesStatus && matchesType;
  });

  const handleExport = () => {
    exportPersonnelToExcel(filteredPersonnel, organizations, tenantDepts);
    toast({ title: 'Экспорт завершен', description: 'Файл персонала загружен' });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const people = await importPersonnelFromExcel(file, user!.tenantId!, organizations, tenantDepts);
      importPersonnel(people);
      toast({ title: 'Импорт завершен', description: `Добавлено сотрудников: ${people.length}` });
    } catch (error) {
      toast({ title: 'Ошибка импорта', description: 'Проверьте формат файла', variant: 'destructive' });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRoleBadge = (role: Personnel['role']) => {
    const variants = {
      Auditor: 'default',
      Manager: 'secondary',
      Director: 'destructive',
      Contractor: 'outline'
    } as const;
    
    const labels = {
      Auditor: 'Аудитор',
      Manager: 'Менеджер',
      Director: 'Директор',
      Contractor: 'Подрядчик'
    };

    return <Badge variant={variants[role]}>{labels[role]}</Badge>;
  };

  const getTypeBadge = (type: PersonnelType) => {
    return type === 'employee' 
      ? <Badge variant="default" className="text-xs">Штатный</Badge>
      : <Badge variant="secondary" className="text-xs">Подрядчик</Badge>;
  };

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) return org.name;
    const extOrg = externalOrganizations.find(o => o.id === orgId);
    return extOrg?.name || '—';
  };

  const getDepartmentName = (deptId: string) => {
    return tenantDepts.find(d => d.id === deptId)?.name || '—';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground">
            Всего: {tenantPersonnel.length} (активных: {tenantPersonnel.filter(p => p.status === 'active').length})
          </p>
          <Input
            placeholder="Поиск по ФИО, должности, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72"
          />
          <Select value={filterOrg} onValueChange={setFilterOrg}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Организация" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все организации</SelectItem>
              {tenantOrgs.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="employee">Штатные</SelectItem>
              <SelectItem value="contractor">Подрядчики</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <ViewModeToggle
            value={viewMode}
            onChange={handleViewModeChange}
            modes={['cards', 'table']}
          />
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Icon name="Download" size={14} />
            Экспорт
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Icon name="Upload" size={14} />
            Импорт
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          <Button onClick={onAdd} size="sm" className="gap-2">
            <Icon name="UserPlus" size={14} />
            Добавить
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Должность</TableHead>
                <TableHead>Организация</TableHead>
                <TableHead>Подразделение</TableHead>
                <TableHead>Области аттестации</TableHead>
                <TableHead>Контакты</TableHead>
                <TableHead className="text-center">Роль</TableHead>
                <TableHead className="text-center">Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersonnel.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    <Icon name="Search" size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Сотрудники не найдены</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPersonnel.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.fullName}</TableCell>
                    <TableCell>{getTypeBadge(person.personnelType)}</TableCell>
                    <TableCell>{person.positionName}</TableCell>
                    <TableCell>
                      <div className="text-sm">{getOrganizationName(person.organizationId)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{person.personnelType === 'employee' ? getDepartmentName(person.departmentId) : '—'}</div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const certs = getCertificationsByPerson(person.personId);
                        if (certs.length === 0) {
                          return <span className="text-sm text-muted-foreground">—</span>;
                        }
                        return (
                          <div className="flex flex-wrap gap-1">
                            {certs.map((cert) => {
                              const comp = competenciesDirectory.find(c => c.id === cert.competencyId);
                              const isExpired = new Date(cert.expiryDate) < new Date();
                              const isExpiring = !isExpired && new Date(cert.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                              return (
                                <Badge 
                                  key={cert.id} 
                                  variant={isExpired ? 'destructive' : isExpiring ? 'secondary' : 'default'}
                                  className="text-xs"
                                >
                                  {comp?.code || '—'}
                                </Badge>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {person.email && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Icon name="Mail" size={12} />
                            <span className="truncate max-w-[180px]">{person.email}</span>
                          </div>
                        )}
                        {person.phone && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Icon name="Phone" size={12} />
                            <span>{person.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getRoleBadge(person.role)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={person.status === 'active' ? 'default' : 'secondary'}>
                        {person.status === 'active' ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onEdit(person)}
                        >
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onDelete(person.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPersonnel.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Icon name="Search" size={48} className="mx-auto mb-4 opacity-20" />
              <p>Сотрудники не найдены</p>
            </div>
          ) : (
            filteredPersonnel.map((person) => (
              <Card key={person.id}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{person.fullName}</h3>
                        {getTypeBadge(person.personnelType)}
                      </div>
                      <p className="text-sm text-muted-foreground">{person.positionName}</p>
                    </div>
                    <Badge variant={person.status === 'active' ? 'default' : 'secondary'}>
                      {person.status === 'active' ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="Building2" size={14} />
                      <span>{getOrganizationName(person.organizationId)}</span>
                    </div>
                    {person.personnelType === 'employee' && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="Building" size={14} />
                        <span>{getDepartmentName(person.departmentId)}</span>
                      </div>
                    )}
                    {person.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="Mail" size={14} />
                        <span className="truncate">{person.email}</span>
                      </div>
                    )}
                    {person.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="Phone" size={14} />
                        <span>{person.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    {getRoleBadge(person.role)}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => onEdit(person)}
                    >
                      <Icon name="Pencil" size={14} />
                      Изменить
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(person.id)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}