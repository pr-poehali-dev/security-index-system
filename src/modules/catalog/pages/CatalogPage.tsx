import { useState, useMemo } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { SearchBar } from '@/components/ui/search-bar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ViewModeToggle, type ViewMode } from '@/components/ui/view-mode-toggle';
import OrganizationTree from '@/components/shared/OrganizationTree';
import ObjectCard from '../components/ObjectCard';
import ObjectTableView from '../components/ObjectTableView';
import ObjectFormModal from '../components/ObjectFormModal';
import ObjectDetailsModal from '../components/ObjectDetailsModal';
import OrganizationFormModal from '../components/OrganizationFormModal';
import type { IndustrialObject } from '@/types/catalog';

export default function CatalogPage() {
  const { objects, selectedOrganization } = useCatalogStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedObject, setSelectedObject] = useState<IndustrialObject | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [orgFormModalOpen, setOrgFormModalOpen] = useState(false);
  const [orgFormMode, setOrgFormMode] = useState<'create' | 'edit'>('create');

  const handleCreateObject = () => {
    setSelectedObject(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  const handleCreateOrganization = () => {
    setOrgFormMode('create');
    setOrgFormModalOpen(true);
  };

  const handleEditObject = (object: IndustrialObject) => {
    setSelectedObject(object);
    setFormMode('edit');
    setFormModalOpen(true);
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
    <div className="h-full flex flex-col">
      <PageHeader
        title="Каталог объектов"
        description="Учет опасных производственных объектов и оборудования"
        icon="Building"
        action={
          <Button className="gap-2" onClick={handleCreateObject}>
            <Icon name="Plus" size={18} />
            Добавить объект
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Building" className="text-blue-600" size={24} />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm text-muted-foreground">Всего объектов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
              <span className="text-2xl font-bold">{stats.active}</span>
            </div>
            <p className="text-sm text-muted-foreground">Активных</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="AlertTriangle" className="text-red-600" size={24} />
              <span className="text-2xl font-bold">{stats.needsExpertise}</span>
            </div>
            <p className="text-sm text-muted-foreground">Просрочена ЭПБ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Clock" className="text-amber-600" size={24} />
              <span className="text-2xl font-bold">{stats.soonExpertise}</span>
            </div>
            <p className="text-sm text-muted-foreground">ЭПБ через 90 дней</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 min-h-0">
        <Card className="overflow-hidden flex flex-col">
          <CardContent className="p-4 flex-1 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Организации</h3>
              <Button variant="ghost" size="sm" onClick={handleCreateOrganization}>
                <Icon name="Plus" size={16} />
              </Button>
            </div>
            <OrganizationTree />
          </CardContent>
        </Card>

        <div className="flex flex-col min-h-0">
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

          <div className="flex-1 overflow-auto">
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
                  <div className={`
                    ${viewMode === 'grid' 
                      ? 'grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4' 
                      : 'space-y-3'
                    }
                  `}>
                    {filteredObjects.map((obj) => (
                      <ObjectCard 
                        key={obj.id} 
                        object={obj}
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

      <ObjectFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        object={selectedObject || undefined}
        mode={formMode}
      />

      <ObjectDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        object={selectedObject}
        onEdit={handleEditObject}
      />

      <OrganizationFormModal
        open={orgFormModalOpen}
        onOpenChange={setOrgFormModalOpen}
        mode={orgFormMode}
      />
    </div>
  );
}