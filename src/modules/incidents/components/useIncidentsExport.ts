import * as XLSX from 'xlsx';
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

const COL_WIDTHS = [
  { wch: 5 }, { wch: 20 }, { wch: 20 }, { wch: 12 },
  { wch: 15 }, { wch: 15 }, { wch: 40 }, { wch: 40 },
  { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
  { wch: 12 }, { wch: 10 }, { wch: 25 }, { wch: 30 }
];

export function useIncidentsExport(helpers: ExportHelpers) {
  const createExportData = (incidents: Incident[]) => {
    return incidents.map((inc, index) => ({
      '№': index + 1,
      'Организация': helpers.getOrganizationName(inc.organizationId),
      'Площадка': helpers.getProductionSiteName(inc.productionSiteId),
      'Дата': new Date(inc.reportDate).toLocaleDateString('ru-RU'),
      'Источник': helpers.getSourceName(inc.sourceId),
      'Направление': helpers.getDirectionName(inc.directionId),
      'Описание': inc.description,
      'Корректирующее мероприятие': inc.correctiveAction,
      'Категория': helpers.getCategoryName(inc.categoryId),
      'Подкатегория': helpers.getSubcategoryName(inc.subcategoryId),
      'Обеспечение работ': helpers.getFundingTypeName(inc.fundingTypeId),
      'Ответственный': helpers.getResponsibleName(inc.responsiblePersonnelId),
      'Плановая дата': new Date(inc.plannedDate).toLocaleDateString('ru-RU'),
      'Дней осталось': inc.daysLeft,
      'Статус': STATUS_LABELS[inc.status],
      'Комментарий': inc.comments || ''
    }));
  };

  const exportToExcel = (incidents: Incident[], fileName: string) => {
    const exportData = createExportData(incidents);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Инциденты');
    
    worksheet['!cols'] = COL_WIDTHS;
    
    XLSX.writeFile(workbook, fileName);
  };

  const handleExportAll = (filteredIncidents: Incident[]) => {
    const fileName = `Инциденты_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
    exportToExcel(filteredIncidents, fileName);
  };

  const handleExportSelected = (filteredIncidents: Incident[], selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    
    const selectedIncidents = filteredIncidents.filter(inc => selectedIds.includes(inc.id));
    const fileName = `Инциденты_выбранные_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
    exportToExcel(selectedIncidents, fileName);
  };

  return {
    handleExportAll,
    handleExportSelected
  };
}
