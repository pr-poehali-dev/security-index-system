import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useToast } from '@/hooks/use-toast';
import { Facility } from '@/types/facilities';
import FacilityDialog from './FacilityDialog';
import FacilityTreeView from './FacilityTreeView';
import ComponentDialog from './ComponentDialog';

export default function OpoTab() {
  const user = useAuthStore((state) => state.user);
  const { getOrganizationsByTenant } = useSettingsStore();
  const { getFacilitiesByTenant, deleteFacility, getComponentsByFacility } = useFacilitiesStore();
  
  const organizations = user?.tenantId ? getOrganizationsByTenant(user.tenantId) : [];
  const allFacilities = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];
  const facilities = allFacilities.filter(f => f.type === 'opo');
  const allComponents = user?.tenantId ? useFacilitiesStore.getState().getComponentsByTenant(user.tenantId) : [];
  
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showComponentDialog, setShowComponentDialog] = useState(false);
  const [editingFacility, setEditingFacility] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [selectedParentOpoId, setSelectedParentOpoId] = useState<string | null>(null);
  const [selectedComponentType, setSelectedComponentType] = useState<'technical_device' | 'building_structure' | null>(null);

  const filteredOrganizations = organizations.filter((org) => {
    const query = searchQuery.toLowerCase();
    return org.name.toLowerCase().includes(query) || org.inn.includes(query);
  });

  const filteredFacilities = facilities.filter((facility) => {
    const query = searchQuery.toLowerCase();
    return (
      facility.fullName.toLowerCase().includes(query) ||
      facility.typicalName?.toLowerCase().includes(query) ||
      facility.registrationNumber?.toLowerCase().includes(query) ||
      facility.organizationName.toLowerCase().includes(query)
    );
  });

  const handleAddOpo = (organizationId: string) => {
    setSelectedOrganizationId(organizationId);
    setSelectedParentOpoId(null);
    setSelectedSubType(null);
    setEditingFacility(null);
    setShowDialog(true);
  };

  const handleAddTuZs = (parentOpoId: string, subType: 'tu' | 'zs') => {
    setSelectedParentOpoId(parentOpoId);
    setSelectedComponentType(subType === 'tu' ? 'technical_device' : 'building_structure');
    setEditingComponent(null);
    setShowComponentDialog(true);
  };

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility.id);
    setSelectedOrganizationId(facility.organizationId);
    setSelectedParentOpoId(facility.parentId || null);
    setSelectedSubType(facility.subType || null);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    const facility = facilities.find(f => f.id === id);
    const components = getComponentsByFacility(id);
    const childFacilities = facilities.filter(f => f.parentId === id);
    
    let confirmMessage = '';
    
    if (facility?.subType) {
      confirmMessage = components.length > 0 
        ? `У ${facility.subType === 'tu' ? 'ТУ' : 'ЗС'} есть ${components.length} компонентов. Удалить и все компоненты?`
        : `Удалить ${facility.subType === 'tu' ? 'ТУ' : 'ЗС'}?`;
    } else {
      const totalChildren = childFacilities.length + components.length;
      if (totalChildren > 0) {
        confirmMessage = `У ОПО есть ${childFacilities.length} дочерних объектов (ТУ/ЗС) и ${components.length} компонентов. Удалить ОПО и всё дочернее?`;
      } else {
        confirmMessage = 'Удалить ОПО?';
      }
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    childFacilities.forEach(child => deleteFacility(child.id));
    deleteFacility(id);
    
    const itemType = facility?.subType === 'tu' ? 'ТУ' : facility?.subType === 'zs' ? 'ЗС' : 'ОПО';
    toast({ title: `${itemType} удалено` });
  };

  const stats = {
    totalOpo: facilities.length,
    totalTu: allComponents.filter(c => c.type === 'technical_device').length,
    totalZs: allComponents.filter(c => c.type === 'building_structure').length,
    class1: facilities.filter(f => f.hazardClass === 'I').length,
    class2: facilities.filter(f => f.hazardClass === 'II').length,
    class3: facilities.filter(f => f.hazardClass === 'III').length,
    class4: facilities.filter(f => f.hazardClass === 'IV').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Icon name="Factory" size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalOpo}</p>
                <p className="text-xs text-muted-foreground">ОПО</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Icon name="Cpu" size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTu}</p>
                <p className="text-xs text-muted-foreground">ТУ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <Icon name="Building" size={20} className="text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalZs}</p>
                <p className="text-xs text-muted-foreground">ЗС</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Icon name="AlertCircle" size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.class1}</p>
                <p className="text-xs text-muted-foreground">I класс</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Icon name="AlertTriangle" size={20} className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.class2}</p>
                <p className="text-xs text-muted-foreground">II класс</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Icon name="AlertTriangle" size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.class3}</p>
                <p className="text-xs text-muted-foreground">III класс</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Icon name="Shield" size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.class4}</p>
                <p className="text-xs text-muted-foreground">IV класс</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Иерархия ОПО</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Организации → ОПО → Технические устройства (ТУ) / Здания и сооружения (ЗС)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Поиск по организациям, ОПО, ТУ, ЗС..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <FacilityTreeView
            organizations={filteredOrganizations}
            facilities={filteredFacilities}
            onAddOpo={handleAddOpo}
            onAddTuZs={handleAddTuZs}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <FacilityDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        facilityId={editingFacility}
        preselectedOrganizationId={selectedOrganizationId}
        parentOpoId={selectedParentOpoId}
        subType={null}
      />

      <ComponentDialog
        open={showComponentDialog}
        onOpenChange={setShowComponentDialog}
        componentId={editingComponent}
        preselectedFacilityId={selectedParentOpoId}
        preselectedType={selectedComponentType}
      />
    </div>
  );
}