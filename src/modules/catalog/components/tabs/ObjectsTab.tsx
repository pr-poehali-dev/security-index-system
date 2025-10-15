import { useState, useMemo, useEffect } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { Card, CardContent } from '@/components/ui/card';
import { SearchBar } from '@/components/ui/search-bar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ViewModeToggle, type ViewMode } from '@/components/ui/view-mode-toggle';
import OrganizationTree from '@/components/shared/OrganizationTree';
import ObjectCard from '../ObjectCard';
import ObjectTableView from '../ObjectTableView';

import ObjectDetailsModal from '../ObjectDetailsModal';
import OrganizationFormModal from '../OrganizationFormModal';
import OpoFormWizard from '../wizard/OpoFormWizard';
import ImportModal from '../ImportModal';
import type { IndustrialObject, Organization } from '@/types/catalog';

export default function ObjectsTab() {
  const { objects, selectedOrganization } = useCatalogStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<'create' | 'edit'>('create');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedObject, setSelectedObject] = useState<IndustrialObject | null>(null);
  const [orgFormModalOpen, setOrgFormModalOpen] = useState(false);
  const [orgFormMode, setOrgFormMode] = useState<'create' | 'edit'>('create');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('catalog-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('catalog-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleCreateOpo = () => {
    setSelectedObject(null);
    setWizardMode('create');
    setWizardOpen(true);
  };

  const handleCreateOrganization = () => {
    setSelectedOrg(null);
    setOrgFormMode('create');
    setOrgFormModalOpen(true);
  };

  const handleEditOrganization = (org: Organization) => {
    setSelectedOrg(org);
    setOrgFormMode('edit');
    setOrgFormModalOpen(true);
  };

  const handleDeleteOrganization = () => {
    // Callback after delete if needed
  };

  const handleEditObject = (object: IndustrialObject) => {
    setSelectedObject(object);
    setWizardMode('edit');
    setWizardOpen(true);
    setDetailsModalOpen(false);
  };

  const handleViewObject = (object: IndustrialObject) => {
    setSelectedObject(object);
    setDetailsModalOpen(true);
  };

  const filteredObjects = useMemo(() => {
    return objects.filter((obj) => {
      const matchesSearch = obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           obj.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           obj.location.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || obj.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || obj.status === statusFilter;
      const matchesOrg = !selectedOrganization || obj.organizationId === selectedOrganization;
      
      return matchesSearch && matchesType && matchesStatus && matchesOrg;
    });
  }, [objects, searchQuery, typeFilter, statusFilter, selectedOrganization]);

  const stats = useMemo(() => {
    const total = filteredObjects.length;
    const active = filteredObjects.filter(o => o.status === 'active').length;
    const needsExpertise = filteredObjects.filter(o => 
      o.nextExpertiseDate && new Date(o.nextExpertiseDate) < new Date()
    ).length;
    const soonExpertise = filteredObjects.filter(o => {
      if (!o.nextExpertiseDate) return false;
      const diffDays = Math.floor((new Date(o.nextExpertiseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 90 && diffDays >= 0;
    }).length;
    
    return { total, active, needsExpertise, soonExpertise };
  }, [filteredObjects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Опасные производственные объекты</h2>
          <p className="text-muted-foreground mt-1">
            Реестр ОПО, оборудования под надзором и зданий
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportModalOpen(true)}>
            <Icon name="Upload" size={18} className="mr-2" />
            Импорт
          </Button>
          <Button onClick={handleCreateOpo}>
            <Icon name="Plus" size={18} className="mr-2" />
            Создать ОПО
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Building" className="text-blue-600" size={20} />
              <span className="text-xl md:text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Всего объектов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle2" className="text-emerald-600" size={20} />
              <span className="text-xl md:text-2xl font-bold">{stats.active}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Активных</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="AlertTriangle" className="text-red-600" size={20} />
              <span className="text-xl md:text-2xl font-bold">{stats.needsExpertise}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Просрочена ЭПБ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Clock" className="text-amber-600" size={20} />
              <span className="text-xl md:text-2xl font-bold">{stats.soonExpertise}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">ЭПБ через 90 дней</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 md:gap-6">
        <div className="relative">
          {!sidebarCollapsed && (
            <Card className="overflow-hidden flex flex-col max-h-[600px] w-[320px]">
              <CardContent className="p-4 flex-1 overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Организации</h3>
                  <Button variant="ghost" size="sm" onClick={handleCreateOrganization}>
                    <Icon name="Plus" size={16} />
                  </Button>
                </div>
                <OrganizationTree 
                  onEdit={handleEditOrganization}
                  onDelete={handleDeleteOrganization}
                />
              </CardContent>
            </Card>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`absolute top-2 z-10 shadow-md ${sidebarCollapsed ? 'left-0' : 'right-2'}`}
            title={sidebarCollapsed ? 'Показать организации' : 'Скрыть организации'}
          >
            <Icon name={sidebarCollapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={16} />
          </Button>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Поиск по названию, рег. номеру, адресу..."
              className="flex-1"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="opo">ОПО</SelectItem>
                <SelectItem value="gts">ГТС</SelectItem>
                <SelectItem value="building">Здание</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активен</SelectItem>
                <SelectItem value="conservation">На консервации</SelectItem>
                <SelectItem value="liquidated">Ликвидирован</SelectItem>
              </SelectContent>
            </Select>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>

          <div>
            {filteredObjects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Search" className="mx-auto mb-3" size={48} />
                <p className="text-lg font-medium">Объекты не найдены</p>
                <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{filteredObjects.length} объект(ов)</Badge>
                  {selectedOrganization && (
                    <Badge variant="outline" className="gap-1">
                      <Icon name="Filter" size={12} />
                      Фильтр по организации
                    </Badge>
                  )}
                </div>
                {viewMode === 'table' ? (
                  <ObjectTableView
                    objects={filteredObjects}
                    onView={handleViewObject}
                    onEdit={handleEditObject}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredObjects.map((object) => (
                      <ObjectCard
                        key={object.id}
                        object={object}
                        onView={handleViewObject}
                        onEdit={handleEditObject}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ObjectDetailsModal
        object={selectedObject}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        onEdit={handleEditObject}
      />

      <OrganizationFormModal
        open={orgFormModalOpen}
        onOpenChange={setOrgFormModalOpen}
        organization={orgFormMode === 'edit' ? selectedOrg : undefined}
        mode={orgFormMode}
      />

      <OpoFormWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        mode={wizardMode}
        object={wizardMode === 'edit' ? selectedObject || undefined : undefined}
      />

      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
      />
    </div>
  );
}