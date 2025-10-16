import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { SortableTableHeader, type SortDirection } from '@/components/ui/sortable-table-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Training } from '@/stores/trainingsAttestationStore';
import type { OrganizationContractor } from '@/stores/settingsStore';
import { getTrainingTypeLabel, getTrainingTypeColor } from '@/modules/attestation/utils/typeHelpers';
import { getTrainingStatusLabel, getTrainingStatusColor } from '@/modules/attestation/utils/statusHelpers';
import { formatDate, formatCurrency } from '@/modules/attestation/utils/formatters';

interface TrainingsTableViewProps {
  trainings: Training[];
  trainingOrgs: OrganizationContractor[];
  onView: (trainingId: string) => void;
  onEdit: (trainingId: string) => void;
  onViewDocuments: (trainingId: string) => void;
  onViewParticipants: (trainingId: string) => void;
  onDuplicate: (trainingId: string) => void;
  onDelete: (trainingId: string) => void;
}



export default function TrainingsTableView({
  trainings,
  trainingOrgs,
  onView,
  onEdit,
  onViewDocuments,
  onViewParticipants,
  onDuplicate,
  onDelete
}: TrainingsTableViewProps) {
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: SortDirection }>({ 
    field: 'startDate', 
    direction: 'desc' 
  });

  const getOrganizationName = (orgId: string) => {
    const org = trainingOrgs.find(o => o.id === orgId);
    return org?.contractorName || 'Неизвестная организация';
  };

  const handleSort = (field: string) => {
    setSortConfig(prev => {
      if (prev.field !== field) {
        return { field, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      if (prev.direction === 'desc') {
        return { field, direction: null };
      }
      return { field, direction: 'asc' };
    });
  };

  const sortedTrainings = useMemo(() => {
    if (!sortConfig.direction) return trainings;

    return [...trainings].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'status':
          const statusOrder = { planned: 1, ongoing: 2, in_progress: 3, completed: 4, cancelled: 5 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case 'endDate':
          aValue = new Date(a.endDate).getTime();
          bValue = new Date(b.endDate).getTime();
          break;
        case 'participants':
          aValue = a.employeeIds.length;
          bValue = b.employeeIds.length;
          break;
        case 'cost':
          aValue = a.cost;
          bValue = b.cost;
          break;
        case 'organization':
          aValue = getOrganizationName(a.organizationId).toLowerCase();
          bValue = getOrganizationName(b.organizationId).toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [trainings, sortConfig]);

  if (trainings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Icon name="GraduationCap" className="mx-auto mb-3" size={48} />
        <p className="text-lg font-medium mb-1">Обучения не найдены</p>
        <p className="text-sm">Запланируйте первое обучение или измените фильтры</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <SortableTableHeader
                label="Название"
                field="title"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Тип"
                field="type"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Статус"
                field="status"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Начало"
                field="startDate"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Окончание"
                field="endDate"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Организация"
                field="organization"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Участников"
                field="participants"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Стоимость"
                field="cost"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <th className="text-right p-3 font-semibold text-sm">Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrainings.map((training) => {
              const hasProgress = training.status === 'in_progress' && training.sdoProgress !== undefined;
              
              return (
                <tr 
                  key={training.id}
                  className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Icon name="GraduationCap" size={16} className="text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">{training.title}</p>
                        {hasProgress && (
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={training.sdoProgress} className="h-1.5 w-24" />
                            <span className="text-xs text-muted-foreground">{training.sdoProgress}%</span>
                          </div>
                        )}
                        {training.certificateNumber && (
                          <div className="flex items-center gap-1 mt-1 text-green-600 dark:text-green-400">
                            <Icon name="Award" size={12} />
                            <span className="text-xs">{training.certificateNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge className={getTrainingTypeColor(training.type)}>
                      {getTrainingTypeLabel(training.type)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge className={getTrainingStatusColor(training.status)}>
                      {getTrainingStatusLabel(training.status)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span className="text-sm">{formatDate(training.startDate)}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm">{formatDate(training.endDate)}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-muted-foreground truncate max-w-[150px] inline-block">
                      {getOrganizationName(training.organizationId)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Icon name="Users" size={14} className="text-muted-foreground" />
                      <span className="text-sm">{training.employeeIds.length}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm">{formatCurrency(training.cost)}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(training.id)}
                        title="Просмотр"
                      >
                        <Icon name="Eye" size={16} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Icon name="MoreVertical" size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(training.id)}>
                            <Icon name="Edit" size={16} className="mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewParticipants(training.id)}>
                            <Icon name="Users" size={16} className="mr-2" />
                            Участники
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewDocuments(training.id)}>
                            <Icon name="FileText" size={16} className="mr-2" />
                            Документы
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate(training.id)}>
                            <Icon name="Copy" size={16} className="mr-2" />
                            Дублировать
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(training.id)}
                            className="text-red-600"
                          >
                            <Icon name="Trash2" size={16} className="mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}