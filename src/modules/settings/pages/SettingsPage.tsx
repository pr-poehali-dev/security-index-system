// src/modules/settings/pages/SettingsPage.tsx
// Описание: Страница настроек - организации, персонал, справочники и пользователи
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
import OrganizationsTab from '../components/tabs/OrganizationsTab';
import DepartmentsTab from '../components/tabs/DepartmentsTab';
import PersonnelTab from '../components/tabs/PersonnelTab';
import CompetenciesTab from '../components/tabs/CompetenciesTab';

import PositionsDirectoryTab from '../components/tabs/PositionsDirectoryTab';
import ExternalOrganizationsTab from '../components/tabs/ExternalOrganizationsTab';
import AddCompetencyDialog from '../components/AddCompetencyDialog';
import EditCompetencyDialog from '../components/EditCompetencyDialog';
import ProductionSitesTab from '../components/tabs/ProductionSitesTab';
import ProductionSiteDialog from '../components/ProductionSiteDialog';
import SystemUsersTab from '../components/tabs/SystemUsersTab';
import AddSystemUserDialog from '../components/AddSystemUserDialog';
import EditSystemUserDialog from '../components/EditSystemUserDialog';
import ExternalOrganizationDialog from '../components/ExternalOrganizationDialog';

import PositionDialog from '../components/PositionDialog';
import ContractorsTab from '../components/tabs/ContractorsTab';
import ContractorDialog from '../components/ContractorDialog';
import type { Organization, Department, Personnel, CompetencyMatrix, ProductionSite, SystemUser, ExternalOrganization, Position, OrganizationContractor } from '@/types';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const {
    deleteOrganization,
    deleteDepartment,
    deletePerson,
    deletePosition,
    deletePersonnel,
    deleteCompetency,
    deleteProductionSite,
    deleteSystemUser,
    deleteExternalOrganization,
    deleteContractor
  } = useSettingsStore();
  
  const { toast } = useToast();

  const [showAddOrg, setShowAddOrg] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);

  const [showAddPosition, setShowAddPosition] = useState(false);
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [showAddCompetency, setShowAddCompetency] = useState(false);
  const [showAddSite, setShowAddSite] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddExternalOrg, setShowAddExternalOrg] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [editingPositionObj, setEditingPositionObj] = useState<Position | null>(null);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [editingCompetency, setEditingCompetency] = useState<CompetencyMatrix | null>(null);
  const [editingSite, setEditingSite] = useState<ProductionSite | null>(null);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editingExternalOrg, setEditingExternalOrg] = useState<ExternalOrganization | null>(null);
  const [showAddContractor, setShowAddContractor] = useState(false);
  const [editingContractor, setEditingContractor] = useState<OrganizationContractor | null>(null);

  const isReadOnly = user?.role !== 'TenantAdmin';
  
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
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

  const handleDeleteCompetency = (id: string) => {
    if (confirm('Удалить запись из справочника компетенций?')) {
      deleteCompetency(id);
      toast({ title: 'Запись удалена' });
    }
  };

  const handleDeleteSite = (id: string) => {
    if (confirm('Удалить производственную площадку?')) {
      deleteProductionSite(id);
      toast({ title: 'Производственная площадка удалена' });
    }
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Удалить пользователя из системы?')) {
      deleteSystemUser(id);
      toast({ title: 'Пользователь удален' });
    }
  };

  const handleDeleteExternalOrg = (id: string) => {
    if (confirm('Удалить стороннюю организацию?')) {
      deleteExternalOrganization(id);
      toast({ title: 'Организация удалена' });
    }
  };

  const handleDeleteContractor = (id: string) => {
    if (confirm('Удалить контрагента?')) {
      deleteContractor(id);
      toast({ title: 'Контрагент удален' });
    }
  };



  const handleDeletePositionObj = (id: string) => {
    if (confirm('Удалить должность из справочника?')) {
      deletePosition(id);
      toast({ title: 'Должность удалена' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
          <p className="text-muted-foreground mt-2">
            Управление организациями, персоналом, компетенциями и сторонними организациями
          </p>
          {isReadOnly && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <Icon name="Info" size={14} />
              Режим просмотра - редактирование доступно только администратору
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="organizations" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Building2" size={20} />
            <span className="text-xs font-medium">Организации</span>
          </TabsTrigger>
          <TabsTrigger value="production-sites" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Factory" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Производственные<br/>площадки</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Building" size={20} />
            <span className="text-xs font-medium">Подразделения</span>
          </TabsTrigger>
          <TabsTrigger value="personnel" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Users" size={20} />
            <span className="text-xs font-medium">Персонал</span>
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Briefcase" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Справочник<br/>должностей</span>
          </TabsTrigger>
          <TabsTrigger value="competencies" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="GraduationCap" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Справочник<br/>компетенций</span>
          </TabsTrigger>
          <TabsTrigger value="contractors" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Handshake" size={20} />
            <span className="text-xs font-medium">Контрагенты</span>
          </TabsTrigger>
          <TabsTrigger value="external-orgs" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Building2" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Сторонние<br/>организации</span>
          </TabsTrigger>
          <TabsTrigger value="system-users" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="UserCog" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Пользователи<br/>системы</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations">
          <OrganizationsTab
            onAdd={() => setShowAddOrg(true)}
            onEdit={setEditingOrg}
            onDelete={handleDeleteOrg}
          />
        </TabsContent>

        <TabsContent value="production-sites">
          <ProductionSitesTab
            onAdd={() => setShowAddSite(true)}
            onEdit={setEditingSite}
            onDelete={handleDeleteSite}
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

        <TabsContent value="positions">
          <PositionsDirectoryTab
            onAdd={() => setShowAddPosition(true)}
            onEdit={setEditingPositionObj}
            onDelete={handleDeletePositionObj}
          />
        </TabsContent>

        <TabsContent value="competencies">
          <CompetenciesTab
            onAdd={() => setShowAddCompetency(true)}
            onEdit={setEditingCompetency}
            onDelete={handleDeleteCompetency}
          />
        </TabsContent>

        <TabsContent value="contractors">
          <ContractorsTab
            onAdd={() => setShowAddContractor(true)}
            onEdit={setEditingContractor}
            onDelete={handleDeleteContractor}
          />
        </TabsContent>

        <TabsContent value="external-orgs">
          <ExternalOrganizationsTab
            onAdd={() => setShowAddExternalOrg(true)}
            onEdit={setEditingExternalOrg}
            onDelete={handleDeleteExternalOrg}
          />
        </TabsContent>

        <TabsContent value="system-users">
          <SystemUsersTab
            onAdd={() => setShowAddUser(true)}
            onEdit={setEditingUser}
            onDelete={handleDeleteUser}
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



      <PositionDialog 
        open={showAddPosition} 
        onOpenChange={setShowAddPosition}
      />

      {editingPositionObj && (
        <PositionDialog 
          position={editingPositionObj}
          open={!!editingPositionObj}
          onOpenChange={(open) => !open && setEditingPositionObj(null)}
        />
      )}

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

      <AddCompetencyDialog 
        open={showAddCompetency} 
        onOpenChange={setShowAddCompetency}
      />

      {editingCompetency && (
        <EditCompetencyDialog 
          competency={editingCompetency}
          open={!!editingCompetency}
          onOpenChange={(open) => !open && setEditingCompetency(null)}
        />
      )}

      <ProductionSiteDialog 
        open={showAddSite || !!editingSite} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddSite(false);
            setEditingSite(null);
          }
        }}
        site={editingSite || undefined}
      />

      <AddSystemUserDialog 
        open={showAddUser} 
        onOpenChange={setShowAddUser}
      />

      {editingUser && (
        <EditSystemUserDialog 
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      )}

      <ExternalOrganizationDialog 
        open={showAddExternalOrg || !!editingExternalOrg} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddExternalOrg(false);
            setEditingExternalOrg(null);
          }
        }}
        organization={editingExternalOrg || undefined}
      />

      <ContractorDialog 
        open={showAddContractor || !!editingContractor} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddContractor(false);
            setEditingContractor(null);
          }
        }}
        contractor={editingContractor || undefined}
      />
    </div>
  );
}