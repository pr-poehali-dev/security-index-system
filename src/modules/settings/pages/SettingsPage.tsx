import { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { exportOrganizationsToCSV, exportPersonnelToCSV, downloadCSV, importOrganizationsFromCSV, importPersonnelFromCSV } from '@/lib/exportUtils';
import AddOrganizationDialog from '@/components/settings/AddOrganizationDialog';
import AddDepartmentDialog from '@/components/settings/AddDepartmentDialog';
import AddPersonnelDialog from '@/components/settings/AddPersonnelDialog';
import EditOrganizationDialog from '@/components/settings/EditOrganizationDialog';
import EditDepartmentDialog from '@/components/settings/EditDepartmentDialog';
import EditPersonnelDialog from '@/components/settings/EditPersonnelDialog';
import type { Organization, Department, Personnel } from '@/types';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const {
    organizations,
    departments,
    personnel,
    getOrganizationsByTenant,
    getDepartmentsByTenant,
    getDepartmentsByOrganization,
    getPersonnelByTenant,
    deleteOrganization,
    deleteDepartment,
    deletePersonnel,
    importOrganizations,
    importDepartments,
    importPersonnel
  } = useSettingsStore();
  
  const { toast } = useToast();
  const orgFileInputRef = useRef<HTMLInputElement>(null);
  const personnelFileInputRef = useRef<HTMLInputElement>(null);

  const [showAddOrg, setShowAddOrg] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  if (!user || user.role !== 'TenantAdmin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const tenantOrgs = getOrganizationsByTenant(user.tenantId!);
  const tenantDepts = getDepartmentsByTenant(user.tenantId!);
  const tenantPersonnel = getPersonnelByTenant(user.tenantId!);

  const handleExportOrganizations = () => {
    const csv = exportOrganizationsToCSV(tenantOrgs, tenantDepts);
    downloadCSV(csv, `organizations_${new Date().toISOString().split('T')[0]}.csv`);
    toast({ title: 'Экспорт завершен', description: 'Файл организаций загружен' });
  };

  const handleExportPersonnel = () => {
    const csv = exportPersonnelToCSV(tenantPersonnel, organizations, tenantDepts);
    downloadCSV(csv, `personnel_${new Date().toISOString().split('T')[0]}.csv`);
    toast({ title: 'Экспорт завершен', description: 'Файл персонала загружен' });
  };

  const handleImportOrganizations = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { organizations: orgs, departments: depts } = await importOrganizationsFromCSV(file, user.tenantId!);
      importOrganizations(orgs);
      importDepartments(depts);
      toast({ title: 'Импорт завершен', description: `Добавлено: ${orgs.length} организаций, ${depts.length} подразделений` });
    } catch (error) {
      toast({ title: 'Ошибка импорта', description: 'Проверьте формат файла', variant: 'destructive' });
    }
    
    if (orgFileInputRef.current) {
      orgFileInputRef.current.value = '';
    }
  };

  const handleImportPersonnel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const people = await importPersonnelFromCSV(file, user.tenantId!, organizations, tenantDepts);
      importPersonnel(people);
      toast({ title: 'Импорт завершен', description: `Добавлено сотрудников: ${people.length}` });
    } catch (error) {
      toast({ title: 'Ошибка импорта', description: 'Проверьте формат файла', variant: 'destructive' });
    }

    if (personnelFileInputRef.current) {
      personnelFileInputRef.current.value = '';
    }
  };

  const handleDeleteOrg = (id: string) => {
    if (confirm('Удалить организацию? Все подразделения и персонал также будут удалены.')) {
      deleteOrganization(id);
      toast({ title: 'Организация удалена' });
    }
  };

  const handleDeleteDept = (id: string) => {
    if (confirm('Удалить подразделение? Весь персонал в нем также будет удален.')) {
      deleteDepartment(id);
      toast({ title: 'Подразделение удалено' });
    }
  };

  const handleDeletePerson = (id: string) => {
    if (confirm('Удалить сотрудника?')) {
      deletePersonnel(id);
      toast({ title: 'Сотрудник удален' });
    }
  };

  const getRoleBadge = (role: Personnel['role']) => {
    const variants = {
      Auditor: 'default',
      Manager: 'secondary',
      Director: 'destructive'
    } as const;
    
    const labels = {
      Auditor: 'Аудитор',
      Manager: 'Менеджер',
      Director: 'Директор'
    };

    return <Badge variant={variants[role]}>{labels[role]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Настройки тенанта</h1>
          <p className="text-muted-foreground mt-2">
            Управление организациями, подразделениями и персоналом
          </p>
        </div>
      </div>

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organizations" className="gap-2">
            <Icon name="Building2" size={16} />
            Организации
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <Icon name="Building" size={16} />
            Подразделения
          </TabsTrigger>
          <TabsTrigger value="personnel" className="gap-2">
            <Icon name="Users" size={16} />
            Персонал
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <p className="text-sm text-muted-foreground">
              Всего организаций: {tenantOrgs.length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportOrganizations} className="gap-2">
                <Icon name="Download" size={14} />
                Экспорт
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => orgFileInputRef.current?.click()}
                className="gap-2"
              >
                <Icon name="Upload" size={14} />
                Импорт
              </Button>
              <input
                ref={orgFileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportOrganizations}
                className="hidden"
              />
              <Button onClick={() => setShowAddOrg(true)} size="sm" className="gap-2">
                <Icon name="Plus" size={14} />
                Добавить
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tenantOrgs.map((org) => {
              const orgDepts = getDepartmentsByOrganization(org.id);
              const orgPersonnel = personnel.filter(p => p.organizationId === org.id);
              
              return (
                <Card key={org.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <CardDescription className="mt-1">
                          ИНН: {org.inn} {org.kpp && `• КПП: ${org.kpp}`}
                        </CardDescription>
                      </div>
                      <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                        {org.status === 'active' ? 'Активна' : 'Неактивна'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {org.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Icon name="MapPin" size={14} className="mt-0.5" />
                        <span className="flex-1">{org.address}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Icon name="Building" size={14} />
                        <span>Подразделений: {orgDepts.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Users" size={14} />
                        <span>Персонал: {orgPersonnel.length}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => setEditingOrg(org)}
                      >
                        <Icon name="Pencil" size={14} />
                        Изменить
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteOrg(org.id)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Всего подразделений: {tenantDepts.length}
              </p>
              <select
                className="text-sm border rounded px-3 py-1"
                value={selectedOrg || ''}
                onChange={(e) => setSelectedOrg(e.target.value || null)}
              >
                <option value="">Все организации</option>
                {tenantOrgs.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => setShowAddDept(true)} size="sm" className="gap-2">
              <Icon name="Plus" size={14} />
              Добавить подразделение
            </Button>
          </div>

          <div className="grid gap-4">
            {(selectedOrg ? tenantDepts.filter(d => d.organizationId === selectedOrg) : tenantDepts).map((dept) => {
              const org = organizations.find(o => o.id === dept.organizationId);
              const parentDept = departments.find(d => d.id === dept.parentId);
              const deptPersonnel = personnel.filter(p => p.departmentId === dept.id);
              const childDepts = departments.filter(d => d.parentId === dept.id);
              
              return (
                <Card key={dept.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{dept.name}</h3>
                          {dept.code && <Badge variant="outline">{dept.code}</Badge>}
                          <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                            {dept.status === 'active' ? 'Активно' : 'Неактивно'}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {org && (
                            <div className="flex items-center gap-2">
                              <Icon name="Building2" size={14} />
                              <span>{org.name}</span>
                            </div>
                          )}
                          {parentDept && (
                            <div className="flex items-center gap-2">
                              <Icon name="ArrowRight" size={14} />
                              <span>Входит в: {parentDept.name}</span>
                            </div>
                          )}
                          {dept.head && (
                            <div className="flex items-center gap-2">
                              <Icon name="User" size={14} />
                              <span>Рук.: {dept.head}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Icon name="Users" size={14} />
                            <span>Персонал: {deptPersonnel.length}</span>
                          </div>
                          {childDepts.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Icon name="Building" size={14} />
                              <span>Подчиненных подразделений: {childDepts.length}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingDept(dept)}
                        >
                          <Icon name="Pencil" size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteDept(dept.id)}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="personnel" className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <p className="text-sm text-muted-foreground">
              Всего сотрудников: {tenantPersonnel.length} (действующих: {tenantPersonnel.filter(p => p.status === 'active').length})
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPersonnel} className="gap-2">
                <Icon name="Download" size={14} />
                Экспорт
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => personnelFileInputRef.current?.click()}
                className="gap-2"
              >
                <Icon name="Upload" size={14} />
                Импорт
              </Button>
              <input
                ref={personnelFileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportPersonnel}
                className="hidden"
              />
              <Button onClick={() => setShowAddPersonnel(true)} size="sm" className="gap-2">
                <Icon name="UserPlus" size={14} />
                Добавить
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {tenantPersonnel.map((person) => {
              const org = organizations.find(o => o.id === person.organizationId);
              const dept = tenantDepts.find(d => d.id === person.departmentId);
              
              return (
                <Card key={person.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-lg">{person.fullName}</h3>
                            {getRoleBadge(person.role)}
                            <Badge variant={person.status === 'active' ? 'default' : 'secondary'}>
                              {person.status === 'active' ? 'Действующий' : 'Уволен'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{person.position}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {org && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Icon name="Building2" size={14} />
                              <span>{org.name}</span>
                            </div>
                          )}
                          {dept && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Icon name="Building" size={14} />
                              <span>{dept.name}</span>
                            </div>
                          )}
                          {person.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Icon name="Mail" size={14} />
                              <span>{person.email}</span>
                            </div>
                          )}
                          {person.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Icon name="Phone" size={14} />
                              <span>{person.phone}</span>
                            </div>
                          )}
                          {person.hireDate && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Icon name="Calendar" size={14} />
                              <span>Принят: {new Date(person.hireDate).toLocaleDateString('ru-RU')}</span>
                            </div>
                          )}
                          {person.dismissalDate && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Icon name="CalendarX" size={14} />
                              <span>Уволен: {new Date(person.dismissalDate).toLocaleDateString('ru-RU')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingPerson(person)}
                        >
                          <Icon name="Pencil" size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeletePerson(person.id)}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <AddOrganizationDialog 
        open={showAddOrg} 
        onOpenChange={setShowAddOrg}
      />
      
      <AddDepartmentDialog 
        open={showAddDept} 
        onOpenChange={setShowAddDept}
      />

      <AddPersonnelDialog 
        open={showAddPersonnel} 
        onOpenChange={setShowAddPersonnel}
      />

      {editingOrg && (
        <EditOrganizationDialog 
          organization={editingOrg}
          open={!!editingOrg}
          onOpenChange={(open) => !open && setEditingOrg(null)}
        />
      )}

      {editingDept && (
        <EditDepartmentDialog 
          department={editingDept}
          open={!!editingDept}
          onOpenChange={(open) => !open && setEditingDept(null)}
        />
      )}

      {editingPerson && (
        <EditPersonnelDialog 
          personnel={editingPerson}
          open={!!editingPerson}
          onOpenChange={(open) => !open && setEditingPerson(null)}
        />
      )}
    </div>
  );
}
