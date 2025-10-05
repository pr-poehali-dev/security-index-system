import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import AddOrganizationDialog from '../components/AddOrganizationDialog';
import AddDepartmentDialog from '../components/AddDepartmentDialog';
import AddPersonnelDialog from '../components/AddPersonnelDialog';
import EditOrganizationDialog from '../components/EditOrganizationDialog';
import EditDepartmentDialog from '../components/EditDepartmentDialog';
import EditPersonnelDialog from '../components/EditPersonnelDialog';
import OrganizationsTab from '../components/OrganizationsTab';
import DepartmentsTab from '../components/DepartmentsTab';
import PersonnelTab from '../components/PersonnelTab';
import type { Organization, Department, Personnel } from '@/types';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const {
    deleteOrganization,
    deleteDepartment,
    deletePersonnel
  } = useSettingsStore();
  
  const { toast } = useToast();

  const [showAddOrg, setShowAddOrg] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);

  if (!user || user.role !== 'TenantAdmin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

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

        <TabsContent value="organizations">
          <OrganizationsTab
            onAdd={() => setShowAddOrg(true)}
            onEdit={setEditingOrg}
            onDelete={handleDeleteOrg}
          />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentsTab
            onAdd={() => setShowAddDept(true)}
            onEdit={setEditingDept}
            onDelete={handleDeleteDept}
          />
        </TabsContent>

        <TabsContent value="personnel">
          <PersonnelTab
            onAdd={() => setShowAddPersonnel(true)}
            onEdit={setEditingPerson}
            onDelete={handleDeletePerson}
          />
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
