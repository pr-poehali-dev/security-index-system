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
import CompetenciesTab from '../components/CompetenciesTab';
import CompetencyGapAnalysisTab from '../components/CompetencyGapAnalysisTab';
import AddCompetencyDialog from '../components/AddCompetencyDialog';
import EditCompetencyDialog from '../components/EditCompetencyDialog';
import ProductionSitesTab from '../components/ProductionSitesTab';
import ProductionSiteDialog from '../components/ProductionSiteDialog';
import type { Organization, Department, Personnel, CompetencyMatrix, ProductionSite } from '@/types';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const {
    deleteOrganization,
    deleteDepartment,
    deletePersonnel,
    deleteCompetency,
    deleteProductionSite
  } = useSettingsStore();
  
  const { toast } = useToast();

  const [showAddOrg, setShowAddOrg] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [showAddCompetency, setShowAddCompetency] = useState(false);
  const [showAddSite, setShowAddSite] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [editingCompetency, setEditingCompetency] = useState<CompetencyMatrix | null>(null);
  const [editingSite, setEditingSite] = useState<ProductionSite | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
          <p className="text-muted-foreground mt-2">
            Управление организациями, подразделениями, персоналом и компетенциями
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
        <TabsList>
          <TabsTrigger value="organizations" className="gap-2">
            <Icon name="Building2" size={16} />
            Организации
          </TabsTrigger>
          <TabsTrigger value="production-sites" className="gap-2">
            <Icon name="Factory" size={16} />
            Производственные площадки
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <Icon name="Building" size={16} />
            Подразделения
          </TabsTrigger>
          <TabsTrigger value="personnel" className="gap-2">
            <Icon name="Users" size={16} />
            Персонал
          </TabsTrigger>
          <TabsTrigger value="competencies" className="gap-2">
            <Icon name="GraduationCap" size={16} />
            Справочник компетенций
          </TabsTrigger>
          <TabsTrigger value="gap-analysis" className="gap-2">
            <Icon name="BarChart3" size={16} />
            Анализ пробелов
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

        <TabsContent value="competencies">
          <CompetenciesTab
            onAdd={() => setShowAddCompetency(true)}
            onEdit={setEditingCompetency}
            onDelete={handleDeleteCompetency}
          />
        </TabsContent>

        <TabsContent value="gap-analysis">
          <CompetencyGapAnalysisTab />
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
    </div>
  );
}