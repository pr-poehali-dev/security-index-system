import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getStatusLabel, getStatusColor } from '../utils/orderUtils';
import type { Training, ExternalOrganization } from '@/types';

interface TrainingsTableViewProps {
  trainings: Training[];
  trainingOrgs: ExternalOrganization[];
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
  if (trainings.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="GraduationCap" size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">Обучения не найдены</p>
        <p className="text-sm text-muted-foreground">Измените параметры поиска или запланируйте новое обучение</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b">
          <tr className="text-left">
            <th className="pb-3 font-medium">Название</th>
            <th className="pb-3 font-medium">Тип</th>
            <th className="pb-3 font-medium">Организация</th>
            <th className="pb-3 font-medium">Даты</th>
            <th className="pb-3 font-medium">Сотрудников</th>
            <th className="pb-3 font-medium">Стоимость</th>
            <th className="pb-3 font-medium">Статус</th>
            <th className="pb-3 font-medium">Действия</th>
          </tr>
        </thead>
        <tbody>
          {trainings.map((training) => {
            const org = trainingOrgs.find(o => o.id === training.organizationId);
            const costPerPerson = Math.round(training.cost / training.employeeIds.length);
            
            return (
              <tr key={training.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="py-3">
                  <div>
                    <div className="font-medium">{training.title}</div>
                    {training.program && (
                      <div className="text-xs text-muted-foreground mt-1">{training.program}</div>
                    )}
                  </div>
                </td>
                <td className="py-3">
                  <Badge className="text-purple-600 bg-purple-100 dark:bg-purple-900/30">
                    {training.type}
                  </Badge>
                </td>
                <td className="py-3 text-muted-foreground text-sm">{org?.name || '—'}</td>
                <td className="py-3 text-muted-foreground text-sm">
                  <div>{new Date(training.startDate).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' })}</div>
                  <div>{new Date(training.endDate).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' })}</div>
                </td>
                <td className="py-3 text-center">{training.employeeIds.length}</td>
                <td className="py-3 text-muted-foreground text-sm">
                  <div className="font-medium">{training.cost.toLocaleString('ru')} ₽</div>
                  <div className="text-xs">{costPerPerson.toLocaleString('ru')} ₽/чел</div>
                </td>
                <td className="py-3">
                  <Badge className={getStatusColor(training.status)}>
                    {getStatusLabel(training.status)}
                  </Badge>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" title="Просмотр" onClick={() => onView(training.id)}>
                      <Icon name="Eye" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" title="Редактировать" onClick={() => onEdit(training.id)}>
                      <Icon name="Edit" size={16} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Icon name="MoreVertical" size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDocuments(training.id)}>
                          <Icon name="FileText" size={14} className="mr-2" />
                          Документы
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewParticipants(training.id)}>
                          <Icon name="Users" size={14} className="mr-2" />
                          Список участников
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDuplicate(training.id)}>
                          <Icon name="Copy" size={14} className="mr-2" />
                          Дублировать
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => onDelete(training.id)}>
                          <Icon name="Trash2" size={14} className="mr-2" />
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
  );
}
