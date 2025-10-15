import { memo, useState } from 'react';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import TablePagination from '@/components/ui/table-pagination';
import type { Incident, IncidentStatus } from '@/types';

interface IncidentsTableViewProps {
  filteredIncidents: Incident[];
  selectedIds: string[];
  startIndex?: number;
  handleSelectAll: (checked: boolean) => void;
  handleSelectOne: (id: string, checked: boolean) => void;
  getOrganizationName: (orgId: string) => string;
  getProductionSiteName: (siteId: string) => string;
  getSourceName: (sourceId: string) => string;
  getDirectionName: (directionId: string) => string;
  getCategoryName: (categoryId: string) => string;
  getSubcategoryName: (subcategoryId: string) => string;
  getResponsibleName: (personnelId: string) => string;
  setEditingIncident: (incident: Incident) => void;
  handleDelete: (id: string) => void;
}

const IncidentsTableView = memo(function IncidentsTableView({
  filteredIncidents,
  selectedIds,
  startIndex = 0,
  handleSelectAll,
  handleSelectOne,
  getOrganizationName,
  getProductionSiteName,
  getSourceName,
  getDirectionName,
  getCategoryName,
  getSubcategoryName,
  getResponsibleName,
  setEditingIncident,
  handleDelete
}: IncidentsTableViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedIncidents = filteredIncidents.slice(startIdx, endIdx);
  
  const getStatusBadge = (status: IncidentStatus) => {
    const variants: Record<IncidentStatus, BadgeVariant> = {
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

  return (
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
          {paginatedIncidents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={14} className="text-center text-muted-foreground py-8">
                Нет данных
              </TableCell>
            </TableRow>
          ) : (
            paginatedIncidents.map((incident, index) => (
              <TableRow key={incident.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(incident.id)}
                    onCheckedChange={(checked) => handleSelectOne(incident.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>{startIdx + index + 1}</TableCell>
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
      
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredIncidents.length}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
      />
    </div>
  );
});

export default IncidentsTableView;