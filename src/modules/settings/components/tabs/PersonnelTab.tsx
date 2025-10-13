import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/hooks/use-toast';
import { useViewMode } from '@/hooks/useViewMode';
import { exportPersonnelToExcel, importPersonnelFromExcel } from '@/lib/exportUtils';
import { usePersonnelData } from '../../hooks/usePersonnelData';
import { usePersonnelFilters } from '../../hooks/usePersonnelFilters';
import PersonnelHeader from '../personnel/PersonnelHeader';
import PersonnelFilters from '../personnel/PersonnelFilters';
import PersonnelTableView from '../personnel/PersonnelTableView';
import PersonnelCardsView from '../personnel/PersonnelCardsView';
import type { Personnel } from '@/types';

interface PersonnelTabProps {
  onAdd: () => void;
  onEdit: (person: Personnel) => void;
  onDelete: (id: string) => void;
}

export default function PersonnelTab({ onAdd, onEdit, onDelete }: PersonnelTabProps) {
  const user = useAuthStore((state) => state.user);
  const {
    organizations,
    getDepartmentsByTenant,
    getOrganizationsByTenant,
    importPersonnel,
  } = useSettingsStore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const { viewMode, setViewMode } = useViewMode('personnel-view-mode');

  const tenantDepts = getDepartmentsByTenant(user!.tenantId!);
  const tenantOrgs = getOrganizationsByTenant(user!.tenantId!);
  const { personnelWithInfo, totalCount } = usePersonnelData(user!.tenantId!);

  const filteredPersonnel = usePersonnelFilters({
    personnel: personnelWithInfo,
    searchTerm,
    filterOrg,
    filterStatus,
    filterType
  });

  const activeCount = personnelWithInfo.filter(p => p.status === 'active').length;

  const handleExport = () => {
    exportPersonnelToExcel(filteredPersonnel, organizations, tenantDepts);
    toast({ title: 'Экспорт завершен', description: 'Файл персонала загружен' });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const people = await importPersonnelFromExcel(file, user!.tenantId!, organizations, tenantDepts);
      importPersonnel(people);
      toast({ title: 'Импорт завершен', description: `Добавлено сотрудников: ${people.length}` });
    } catch (error) {
      toast({ title: 'Ошибка импорта', description: 'Проверьте формат файла', variant: 'destructive' });
    }

    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <PersonnelHeader
        totalCount={totalCount}
        activeCount={activeCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
        onImport={handleImport}
        onAdd={onAdd}
      />

      <PersonnelFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterOrg={filterOrg}
        onFilterOrgChange={setFilterOrg}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        organizations={tenantOrgs}
      />

      {viewMode === 'table' ? (
        <PersonnelTableView
          personnel={filteredPersonnel}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <PersonnelCardsView
          personnel={filteredPersonnel}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}