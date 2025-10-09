import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Incident, IncidentStatus } from '@/types';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';
import IncidentDialog from './IncidentDialog';
import IncidentsDashboard from './IncidentsDashboard';
import * as XLSX from 'xlsx';

export default function IncidentsTab() {
  const user = useAuthStore((state) => state.user);
  const { 
    getIncidentsByTenant, 
    sources, 
    directions, 
    fundingTypes, 
    categories, 
    subcategories,
    deleteIncident 
  } = useIncidentsStore();
  
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
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDashboard, setShowDashboard] = useState(true);

  const incidents = user?.tenantId ? getIncidentsByTenant(user.tenantId) : [];

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch = inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inc.correctiveAction.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
      const matchesDirection = directionFilter === 'all' || inc.directionId === directionFilter;
      
      return matchesSearch && matchesStatus && matchesDirection;
    });
  }, [incidents, searchTerm, statusFilter, directionFilter]);

  const getStatusBadge = (status: IncidentStatus) => {
    const variants: Record<IncidentStatus, any> = {
      created: 'secondary',
      in_progress: 'default',
      awaiting: 'outline',
      overdue: 'destructive',
      completed: 'default',
      completed_late: 'secondary'
    };

    const labels: Record<IncidentStatus, string> = {
      created: 'Создано',
      in_progress: 'В работе',
      awaiting: 'Ожидает исполнения',
      overdue: 'Просрочено',
      completed: 'Исполнено',
      completed_late: 'Исполнено с нарушением срока'
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

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

  const handleDelete = (id: string) => {
    if (confirm('Удалить запись об инциденте?')) {
      deleteIncident(id);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredIncidents.map(inc => inc.id));
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
    if (selectedIds.length === 0) return;
    
    const statusLabels: Record<IncidentStatus, string> = {
      created: 'Создано',
      in_progress: 'В работе',
      awaiting: 'Ожидает исполнения',
      overdue: 'Просрочено',
      completed: 'Исполнено',
      completed_late: 'Исполнено с нарушением срока'
    };

    const selectedIncidents = filteredIncidents.filter(inc => selectedIds.includes(inc.id));
    const exportData = selectedIncidents.map((inc, index) => ({
      '№': index + 1,
      'Организация': getOrganizationName(inc.organizationId),
      'Площадка': getProductionSiteName(inc.productionSiteId),
      'Дата': new Date(inc.reportDate).toLocaleDateString('ru-RU'),
      'Источник': getSourceName(inc.sourceId),
      'Направление': getDirectionName(inc.directionId),
      'Описание': inc.description,
      'Корректирующее мероприятие': inc.correctiveAction,
      'Категория': getCategoryName(inc.categoryId),
      'Подкатегория': getSubcategoryName(inc.subcategoryId),
      'Обеспечение работ': getFundingTypeName(inc.fundingTypeId),
      'Ответственный': getResponsibleName(inc.responsiblePersonnelId),
      'Плановая дата': new Date(inc.plannedDate).toLocaleDateString('ru-RU'),
      'Дней осталось': inc.daysLeft,
      'Статус': statusLabels[inc.status],
      'Комментарий': inc.comments || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Инциденты');
    
    const colWidths = [
      { wch: 5 }, { wch: 20 }, { wch: 20 }, { wch: 12 },
      { wch: 15 }, { wch: 15 }, { wch: 40 }, { wch: 40 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
      { wch: 12 }, { wch: 10 }, { wch: 25 }, { wch: 30 }
    ];
    worksheet['!cols'] = colWidths;
    
    const fileName = `Инциденты_выбранные_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleExportToExcel = () => {
    const statusLabels: Record<IncidentStatus, string> = {
      created: 'Создано',
      in_progress: 'В работе',
      awaiting: 'Ожидает исполнения',
      overdue: 'Просрочено',
      completed: 'Исполнено',
      completed_late: 'Исполнено с нарушением срока'
    };

    const exportData = filteredIncidents.map((inc, index) => ({
      '№': index + 1,
      'Организация': getOrganizationName(inc.organizationId),
      'Площадка': getProductionSiteName(inc.productionSiteId),
      'Дата': new Date(inc.reportDate).toLocaleDateString('ru-RU'),
      'Источник': getSourceName(inc.sourceId),
      'Направление': getDirectionName(inc.directionId),
      'Описание': inc.description,
      'Корректирующее мероприятие': inc.correctiveAction,
      'Категория': getCategoryName(inc.categoryId),
      'Подкатегория': getSubcategoryName(inc.subcategoryId),
      'Обеспечение работ': getFundingTypeName(inc.fundingTypeId),
      'Ответственный': getResponsibleName(inc.responsiblePersonnelId),
      'Плановая дата': new Date(inc.plannedDate).toLocaleDateString('ru-RU'),
      'Дней осталось': inc.daysLeft,
      'Статус': statusLabels[inc.status],
      'Комментарий': inc.comments || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Инциденты');
    
    const colWidths = [
      { wch: 5 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 40 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 10 },
      { wch: 25 },
      { wch: 30 }
    ];
    worksheet['!cols'] = colWidths;
    
    const fileName = `Инциденты_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">
      {showDashboard && (
        <IncidentsDashboard 
          incidents={incidents}
          directions={directions}
          categories={categories}
        />
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Список инцидентов и мероприятий</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDashboard(!showDashboard)}
              >
                <Icon name={showDashboard ? "EyeOff" : "Eye"} size={16} />
                {showDashboard ? "Скрыть аналитику" : "Показать аналитику"}
              </Button>
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

          <div className="flex gap-4 mb-4 flex-wrap">
            <Input
              placeholder="Поиск по описанию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="in_progress">В работе</SelectItem>
                <SelectItem value="awaiting">Ожидает</SelectItem>
                <SelectItem value="overdue">Просрочено</SelectItem>
                <SelectItem value="completed">Исполнено</SelectItem>
              </SelectContent>
            </Select>
            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Направление" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все направления</SelectItem>
                {directions.filter(d => d.status === 'active').map((dir) => (
                  <SelectItem key={dir.id} value={dir.id}>{dir.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredIncidents.length && filteredIncidents.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-12">№</TableHead>
                  <TableHead>Организация</TableHead>
                  <TableHead>Площадка</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Источник</TableHead>
                  <TableHead>Направление</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Ответственный</TableHead>
                  <TableHead>Плановая дата</TableHead>
                  <TableHead>Дней осталось</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-24">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center text-muted-foreground py-8">
                      Нет данных
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIncidents.map((incident, index) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(incident.id)}
                          onCheckedChange={(checked) => handleSelectOne(incident.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="text-sm">{getOrganizationName(incident.organizationId)}</TableCell>
                      <TableCell className="text-sm">{getProductionSiteName(incident.productionSiteId)}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(incident.reportDate).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell className="text-sm">{getSourceName(incident.sourceId)}</TableCell>
                      <TableCell className="text-sm">{getDirectionName(incident.directionId)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm line-clamp-2">{incident.description}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{getCategoryName(incident.categoryId)}</div>
                        <div className="text-xs text-muted-foreground">{getSubcategoryName(incident.subcategoryId)}</div>
                      </TableCell>
                      <TableCell className="text-sm">{getResponsibleName(incident.responsiblePersonnelId)}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(incident.plannedDate).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={incident.daysLeft < 0 ? 'text-red-600 font-semibold' : ''}>
                          {incident.daysLeft}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingIncident(incident)}>
                            <Icon name="Eye" size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingIncident(incident)}>
                            <Icon name="Edit" size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(incident.id)}>
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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