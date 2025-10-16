import { exportToExcel, type ExportColumn } from '@/utils/export';
import type { Incident, IncidentStatus } from '@/types';

interface ExportHelpers {
  getOrganizationName: (orgId: string) => string;
  getProductionSiteName: (siteId: string) => string;
  getSourceName: (sourceId: string) => string;
  getDirectionName: (directionId: string) => string;
  getCategoryName: (categoryId: string) => string;
  getSubcategoryName: (subcategoryId: string) => string;
  getFundingTypeName: (fundingId: string) => string;
  getResponsibleName: (personnelId: string) => string;
}

const STATUS_LABELS: Record<IncidentStatus, string> = {
  created: 'Создано',
  in_progress: 'В работе',
  awaiting: 'Ожидает исполнения',
  overdue: 'Просрочено',
  completed: 'Исполнено',
  completed_late: 'Исполнено с нарушением срока'
};

interface IncidentExport extends Incident {
  _index?: number;
}

export function useIncidentsExport(helpers: ExportHelpers) {
  const columns: ExportColumn<IncidentExport>[] = [
    { key: '_index', label: '№', width: 5, format: (_, item) => (item._index || 0) + 1 },
    { key: 'organizationId', label: 'Организация', width: 20, format: (val) => helpers.getOrganizationName(val as string) },
    { key: 'productionSiteId', label: 'Площадка', width: 20, format: (val) => helpers.getProductionSiteName(val as string) },
    { key: 'reportDate', label: 'Дата', width: 12, format: (val) => new Date(val as string).toLocaleDateString('ru-RU') },
    { key: 'sourceId', label: 'Источник', width: 15, format: (val) => helpers.getSourceName(val as string) },
    { key: 'directionId', label: 'Направление', width: 15, format: (val) => helpers.getDirectionName(val as string) },
    { key: 'description', label: 'Описание', width: 40 },
    { key: 'correctiveAction', label: 'Корректирующее мероприятие', width: 40 },
    { key: 'categoryId', label: 'Категория', width: 15, format: (val) => helpers.getCategoryName(val as string) },
    { key: 'subcategoryId', label: 'Подкатегория', width: 15, format: (val) => helpers.getSubcategoryName(val as string) },
    { key: 'fundingTypeId', label: 'Обеспечение работ', width: 15, format: (val) => helpers.getFundingTypeName(val as string) },
    { key: 'responsiblePersonnelId', label: 'Ответственный', width: 20, format: (val) => helpers.getResponsibleName(val as string) },
    { key: 'plannedDate', label: 'Плановая дата', width: 12, format: (val) => new Date(val as string).toLocaleDateString('ru-RU') },
    { key: 'daysLeft', label: 'Дней осталось', width: 10 },
    { key: 'status', label: 'Статус', width: 25, format: (val) => STATUS_LABELS[val as IncidentStatus] },
    { key: 'comments', label: 'Комментарий', width: 30, format: (val) => val || '' }
  ];

  const handleExportAll = (filteredIncidents: Incident[]) => {
    const dataWithIndex = filteredIncidents.map((inc, index) => ({ ...inc, _index: index }));
    const fileName = `Инциденты_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}`;
    exportToExcel(dataWithIndex, columns, fileName, 'Инциденты');
  };

  const handleExportSelected = (filteredIncidents: Incident[], selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    
    const selectedIncidents = filteredIncidents.filter(inc => selectedIds.includes(inc.id));
    const dataWithIndex = selectedIncidents.map((inc, index) => ({ ...inc, _index: index }));
    const fileName = `Инциденты_выбранные_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}`;
    exportToExcel(dataWithIndex, columns, fileName, 'Инциденты');
  };

  return {
    handleExportAll,
    handleExportSelected
  };
}