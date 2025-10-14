import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ViewModeToggle } from '@/components/ui/view-mode-toggle';
import type { Incident } from '@/types';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';
import IncidentDialog from '../IncidentDialog';
import IncidentKanbanBoard from '../IncidentKanbanBoard';
import IncidentsTableFilters from '../IncidentsTableFilters';
import IncidentsKanbanFilters from '../IncidentsKanbanFilters';
import IncidentsTableView from '../IncidentsTableView';
import IncidentReminders from '../IncidentReminders';
import IncidentsPagination from '../IncidentsPagination';
import { useIncidentsExport } from '../useIncidentsExport';

export default function IncidentsTab() {
  const user = useAuthStore((state) => state.user);
  const allIncidents = useIncidentsStore((state) => state.incidents);
  const sources = useIncidentsStore((state) => state.sources);
  const directions = useIncidentsStore((state) => state.directions);
  const fundingTypes = useIncidentsStore((state) => state.fundingTypes);
  const categories = useIncidentsStore((state) => state.categories);
  const subcategories = useIncidentsStore((state) => state.subcategories);
  const deleteIncident = useIncidentsStore((state) => state.deleteIncident);
  
  const { 
    organizations, 
    productionSites, 
    personnel, 
    people, 
    positions 
  } = useSettingsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const incidents = useMemo(() => 
    user?.tenantId ? allIncidents.filter(inc => inc.tenantId === user.tenantId) : []
  , [allIncidents, user?.tenantId]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch = inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inc.correctiveAction.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
      const matchesDirection = directionFilter === 'all' || inc.directionId === directionFilter;
      const matchesOrganization = organizationFilter === 'all' || inc.organizationId === organizationFilter;
      const matchesSite = siteFilter === 'all' || inc.productionSiteId === siteFilter;
      
      return matchesSearch && matchesStatus && matchesDirection && matchesOrganization && matchesSite;
    });
  }, [incidents, searchTerm, statusFilter, directionFilter, organizationFilter, siteFilter]);

  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredIncidents.slice(startIndex, endIndex);
  }, [filteredIncidents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredIncidents.length / pageSize);

  const getOrganizationName = (orgId: string) => {
    return organizations.find(o => o.id === orgId)?.name || '—';
  };

  const getProductionSiteName = (siteId: string) => {
    return productionSites.find(s => s.id === siteId)?.name || '—';
  };

  const getSourceName = (sourceId: string) => {
    return sources.find(s => s.id === sourceId)?.name || '—';
  };

  const getDirectionName = (directionId: string) => {
    return directions.find(d => d.id === directionId)?.name || '—';
  };

  const getFundingTypeName = (fundingId: string) => {
    return fundingTypes.find(f => f.id === fundingId)?.name || '—';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '—';
  };

  const getSubcategoryName = (subcategoryId: string) => {
    return subcategories.find(s => s.id === subcategoryId)?.name || '—';
  };

  const getResponsibleName = (personnelId: string) => {
    const pers = personnel.find(p => p.id === personnelId);
    if (!pers) return '—';
    const info = getPersonnelFullInfo(pers, people, positions);
    return info.fullName;
  };

  const { handleExportAll, handleExportSelected } = useIncidentsExport({
    getOrganizationName,
    getProductionSiteName,
    getSourceName,
    getDirectionName,
    getCategoryName,
    getSubcategoryName,
    getFundingTypeName,
    getResponsibleName
  });

  const handleDelete = (id: string) => {
    if (confirm('Удалить запись об инциденте?')) {
      deleteIncident(id);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedIncidents.map(inc => inc.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selId => selId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Удалить выбранные записи (${selectedIds.length} шт.)?`)) {
      selectedIds.forEach(id => deleteIncident(id));
      setSelectedIds([]);
    }
  };

  const handleBulkExport = () => {
    handleExportSelected(filteredIncidents, selectedIds);
  };

  const handleExportToExcel = () => {
    handleExportAll(filteredIncidents);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      <IncidentReminders
        incidents={incidents}
        getOrganizationName={getOrganizationName}
        getDirectionName={getDirectionName}
        onIncidentClick={setEditingIncident}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Список инцидентов и мероприятий</h3>
            <div className="flex gap-2">
              <ViewModeToggle
                value={viewMode}
                onChange={setViewMode}
                modes={['table', 'cards']}
              />
              {selectedIds.length > 0 && (
                <>
                  <Button variant="outline" onClick={handleBulkExport}>
                    <Icon name="Download" size={16} />
                    Экспорт выбранных ({selectedIds.length})
                  </Button>
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    <Icon name="Trash2" size={16} />
                    Удалить выбранные ({selectedIds.length})
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={handleExportToExcel}>
                <Icon name="Download" size={16} />
                Выгрузить в Excel
              </Button>
              <Button onClick={() => setShowAddDialog(true)}>
                <Icon name="Plus" size={16} />
                Добавить инцидент
              </Button>
            </div>
          </div>

          {viewMode === 'table' && (
            <IncidentsTableFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              directionFilter={directionFilter}
              setDirectionFilter={setDirectionFilter}
              directions={directions}
            />
          )}

          {viewMode === 'cards' && (
            <IncidentsKanbanFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              directionFilter={directionFilter}
              setDirectionFilter={setDirectionFilter}
              organizationFilter={organizationFilter}
              setOrganizationFilter={setOrganizationFilter}
              siteFilter={siteFilter}
              setSiteFilter={setSiteFilter}
              directions={directions}
              organizations={organizations}
              productionSites={productionSites}
            />
          )}

          {viewMode === 'table' && (
            <>
              <IncidentsTableView
                filteredIncidents={paginatedIncidents}
                selectedIds={selectedIds}
                startIndex={(currentPage - 1) * pageSize}
                handleSelectAll={handleSelectAll}
                handleSelectOne={handleSelectOne}
                getOrganizationName={getOrganizationName}
                getProductionSiteName={getProductionSiteName}
                getSourceName={getSourceName}
                getDirectionName={getDirectionName}
                getCategoryName={getCategoryName}
                getSubcategoryName={getSubcategoryName}
                getResponsibleName={getResponsibleName}
                setEditingIncident={setEditingIncident}
                handleDelete={handleDelete}
              />
              <IncidentsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredIncidents.length}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}

          {viewMode === 'cards' && (
            <IncidentKanbanBoard 
              searchTerm={searchTerm}
              directionFilter={directionFilter}
              organizationFilter={organizationFilter}
              siteFilter={siteFilter}
            />
          )}
        </CardContent>
      </Card>

      {showAddDialog && (
        <IncidentDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />
      )}

      {editingIncident && (
        <IncidentDialog
          incident={editingIncident}
          open={!!editingIncident}
          onOpenChange={(open) => !open && setEditingIncident(null)}
        />
      )}
    </div>
  );
}