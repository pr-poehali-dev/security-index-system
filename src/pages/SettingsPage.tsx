import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import AddOrganizationDialog from '@/components/settings/AddOrganizationDialog';
import AddPersonnelDialog from '@/components/settings/AddPersonnelDialog';
import EditOrganizationDialog from '@/components/settings/EditOrganizationDialog';
import EditPersonnelDialog from '@/components/settings/EditPersonnelDialog';
import type { Organization, Personnel } from '@/types';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const { organizations, personnel, getOrganizationsByTenant, getPersonnelByTenant, deleteOrganization, deletePersonnel } = useSettingsStore();
  
  const [showAddOrg, setShowAddOrg] = useState(false);
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);

  if (!user || user.role !== 'TenantAdmin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const tenantOrgs = getOrganizationsByTenant(user.tenantId!);
  const tenantPersonnel = getPersonnelByTenant(user.tenantId!);

  const handleDeleteOrg = (id: string) => {
    if (confirm('Удалить организацию? Весь связанный персонал также будет удален.')) {
      deleteOrganization(id);
    }
  };

  const handleDeletePerson = (id: string) => {
    if (confirm('Удалить сотрудника?')) {
      deletePersonnel(id);
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
            Управление организациями и персоналом
          </p>
        </div>
      </div>

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organizations" className="gap-2">
            <Icon name="Building2" size={16} />
            Организации
          </TabsTrigger>
          <TabsTrigger value="personnel" className="gap-2">
            <Icon name="Users" size={16} />
            Персонал
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Всего организаций: {tenantOrgs.length}
            </p>
            <Button onClick={() => setShowAddOrg(true)} className="gap-2">
              <Icon name="Plus" size={16} />
              Добавить организацию
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tenantOrgs.map((org) => {
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
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Users" size={14} />
                      <span>Персонал: {orgPersonnel.length} чел.</span>
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

        <TabsContent value="personnel" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Всего сотрудников: {tenantPersonnel.length}
            </p>
            <Button onClick={() => setShowAddPersonnel(true)} className="gap-2">
              <Icon name="UserPlus" size={16} />
              Добавить сотрудника
            </Button>
          </div>

          <div className="grid gap-4">
            {tenantPersonnel.map((person) => {
              const org = organizations.find(o => o.id === person.organizationId);
              
              return (
                <Card key={person.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{person.fullName}</h3>
                            {getRoleBadge(person.role)}
                            <Badge variant={person.status === 'active' ? 'outline' : 'secondary'}>
                              {person.status === 'active' ? 'Активен' : 'Неактивен'}
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
