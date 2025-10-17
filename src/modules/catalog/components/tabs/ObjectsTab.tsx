import { useState, useMemo, useEffect } from 'react';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { SearchBar } from '@/components/ui/search-bar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ViewModeToggle, type ViewMode } from '@/components/ui/view-mode-toggle';
import FacilityDialog from '@/modules/attestation/components/facility-catalog/FacilityDialog';
import ComponentDialog from '@/modules/attestation/components/facility-catalog/ComponentDialog';
import type { Facility, Component } from '@/types/facilities';

export default function ObjectsTab() {
  const user = useAuthStore((state) => state.user);
  const { 
    getFacilitiesByTenant, 
    getComponentsByTenant,
    deleteFacility,
    deleteComponent,
    getComponentsByFacility 
  } = useFacilitiesStore();
  
  const allFacilities = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];
  const allComponents = user?.tenantId ? getComponentsByTenant(user.tenantId) : [];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFacilityDialog, setShowFacilityDialog] = useState(false);
  const [showComponentDialog, setShowComponentDialog] = useState(false);
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('catalog-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('catalog-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleCreateFacility = () => {
    setEditingFacilityId(null);
    setShowFacilityDialog(true);
  };

  const handleEditFacility = (id: string) => {
    setEditingFacilityId(id);
    setShowFacilityDialog(true);
  };

  const handleDeleteFacility = (id: string) => {
    const components = getComponentsByFacility(id);
    if (components.length > 0) {
      if (!confirm(`У объекта есть ${components.length} компонентов. Удалить объект и все компоненты?`)) {
        return;
      }
    }
    deleteFacility(id);
  };

  const handleEditComponent = (id: string) => {
    setEditingComponentId(id);
    setShowComponentDialog(true);
  };

  const handleDeleteComponent = (id: string) => {
    if (confirm('Удалить компонент?')) {
      deleteComponent(id);
    }
  };

  const handleExport = async () => {
    if (filteredItems.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }

    try {
      const { utils, writeFile } = await import('xlsx');

      const exportData = filteredItems.map(item => {
        if ('hazardClass' in item) {
          return {
            'Тип': item.type === 'opo' ? 'ОПО' : 'ГТС',
            'Полное наименование': item.fullName,
            'Типовое наименование': item.typicalName || '',
            'Регистрационный номер': item.registrationNumber || '',
            'Класс опасности': item.hazardClass || '',
            'Организация': item.organizationName,
            'Адрес': item.address,
            'Ответственное лицо': item.responsiblePersonName || '',
          };
        } else {
          return {
            'Тип': 'Компонент',
            'Объект': item.facilityName,
            'Полное наименование': item.fullName,
            'Краткое наименование': item.shortName || '',
            'Тип компонента': item.type === 'technical_device' ? 'Техническое устройство' : 'Здание/Сооружение',
            'Заводской номер': ('factoryNumber' in item ? item.factoryNumber : '') || '',
            'Дата ввода в эксплуатацию': item.commissioningDate || '',
            'Статус': item.technicalStatus || '',
          };
        }
      });

      const worksheet = utils.json_to_sheet(exportData);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Объекты и оборудование');

      const fileName = `объекты_и_оборудование_${new Date().toISOString().split('T')[0]}.xlsx`;
      writeFile(workbook, fileName);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Произошла ошибка при экспорте данных');
    }
  };

  const allItems = useMemo(() => {
    return [...allFacilities, ...allComponents] as Array<Facility | Component>;
  }, [allFacilities, allComponents]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.fullName.toLowerCase().includes(query) ||
        ('registrationNumber' in item && item.registrationNumber?.toLowerCase().includes(query)) ||
        ('organizationName' in item && item.organizationName.toLowerCase().includes(query));
      
      let matchesType = true;
      if (typeFilter !== 'all') {
        if (typeFilter === 'opo' || typeFilter === 'gts') {
          matchesType = 'type' in item && item.type === typeFilter;
        } else if (typeFilter === 'technical_device' || typeFilter === 'building_structure') {
          matchesType = 'facilityId' in item && item.type === typeFilter;
        }
      }
      
      return matchesSearch && matchesType;
    });
  }, [allItems, searchQuery, typeFilter]);

  const stats = useMemo(() => {
    const facilities = allFacilities.length;
    const opo = allFacilities.filter(f => f.type === 'opo').length;
    const gts = allFacilities.filter(f => f.type === 'gts').length;
    const components = allComponents.length;
    
    return { total: facilities + components, facilities, opo, gts, components };
  }, [allFacilities, allComponents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Опасные производственные объекты</h2>
          <p className="text-muted-foreground mt-1">
            Реестр ОПО, ГТС, оборудования под надзором и зданий
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Icon name="FileDown" size={18} className="mr-2" />
            Экспорт
          </Button>
          <Button onClick={handleCreateFacility}>
            <Icon name="Plus" size={18} className="mr-2" />
            Создать объект
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Building" className="text-blue-600" size={20} />
              <span className="text-xl md:text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Всего позиций</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Factory" className="text-orange-600" size={20} />
              <span className="text-xl md:text-2xl font-bold">{stats.opo}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">ОПО</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Waves" className="text-cyan-600" size={20} />
              <span className="text-xl md:text-2xl font-bold">{stats.gts}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">ГТС</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Cpu" className="text-purple-600" size={20} />
              <span className="text-xl md:text-2xl font-bold">{stats.components}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Компонентов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Building2" className="text-emerald-600" size={20} />
              <span className="text-xl md:text-2xl font-bold">{stats.facilities}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Объектов</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Поиск по названию, рег. номеру, организации..."
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="opo">ОПО</SelectItem>
                  <SelectItem value="gts">ГТС</SelectItem>
                  <SelectItem value="technical_device">Технические устройства</SelectItem>
                  <SelectItem value="building_structure">Здания/Сооружения</SelectItem>
                </SelectContent>
              </Select>
              <ViewModeToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Inbox" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Нет данных</h3>
              <p className="text-muted-foreground mb-4">
                Начните с создания первого объекта
              </p>
              <Button onClick={handleCreateFacility}>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать объект
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const isFacility = 'hazardClass' in item;
                return (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon 
                            name={isFacility ? (item.type === 'opo' ? 'Factory' : 'Waves') : 'Cpu'} 
                            size={20}
                            className={isFacility ? (item.type === 'opo' ? 'text-orange-600' : 'text-cyan-600') : 'text-purple-600'}
                          />
                          <span className="text-xs font-medium text-muted-foreground">
                            {isFacility ? (item.type === 'opo' ? 'ОПО' : 'ГТС') : 'Компонент'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => isFacility ? handleEditFacility(item.id) : handleEditComponent(item.id)}
                          >
                            <Icon name="Pencil" size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => isFacility ? handleDeleteFacility(item.id) : handleDeleteComponent(item.id)}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2">{item.fullName}</h3>
                      {isFacility && (
                        <>
                          <p className="text-sm text-muted-foreground mb-2">{item.organizationName}</p>
                          {item.hazardClass && (
                            <div className="inline-block px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded">
                              Класс {item.hazardClass}
                            </div>
                          )}
                        </>
                      )}
                      {!isFacility && (
                        <p className="text-sm text-muted-foreground">{item.facilityName}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded font-medium text-sm">
                <div className="col-span-1">Тип</div>
                <div className="col-span-4">Наименование</div>
                <div className="col-span-3">Организация/Объект</div>
                <div className="col-span-2">Рег. номер/Класс</div>
                <div className="col-span-2 text-right">Действия</div>
              </div>
              {filteredItems.map((item) => {
                const isFacility = 'hazardClass' in item;
                return (
                  <div key={item.id} className="grid grid-cols-12 gap-4 px-4 py-3 border rounded hover:bg-muted/50 transition-colors">
                    <div className="col-span-1 flex items-center">
                      <Icon 
                        name={isFacility ? (item.type === 'opo' ? 'Factory' : 'Waves') : 'Cpu'} 
                        size={18}
                        className={isFacility ? (item.type === 'opo' ? 'text-orange-600' : 'text-cyan-600') : 'text-purple-600'}
                      />
                    </div>
                    <div className="col-span-4">
                      <p className="font-medium">{item.fullName}</p>
                      <p className="text-sm text-muted-foreground">{item.shortName || item.typicalName}</p>
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm">{isFacility ? item.organizationName : item.facilityName}</p>
                    </div>
                    <div className="col-span-2">
                      {isFacility ? (
                        <>
                          <p className="text-sm">{item.registrationNumber}</p>
                          {item.hazardClass && (
                            <span className="text-xs text-muted-foreground">Класс {item.hazardClass}</span>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">{item.type === 'technical_device' ? 'ТУ' : 'ЗС'}</p>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => isFacility ? handleEditFacility(item.id) : handleEditComponent(item.id)}
                      >
                        <Icon name="Pencil" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => isFacility ? handleDeleteFacility(item.id) : handleDeleteComponent(item.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <FacilityDialog
        open={showFacilityDialog}
        onOpenChange={setShowFacilityDialog}
        facilityId={editingFacilityId}
      />

      <ComponentDialog
        open={showComponentDialog}
        onOpenChange={setShowComponentDialog}
        componentId={editingComponentId}
      />
    </div>
  );
}
