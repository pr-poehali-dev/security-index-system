import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Training } from '@/stores/trainingsAttestationStore';
import type { Personnel, Person, Position, OrganizationContractor } from '@/stores/settingsStore';
import { getTrainingTypeLabel, getTrainingTypeColor } from '@/modules/attestation/utils/typeHelpers';
import { getTrainingStatusLabel, getTrainingStatusColor } from '@/modules/attestation/utils/statusHelpers';
import { formatDate, formatCurrency } from '@/modules/attestation/utils/formatters';

interface TrainingsCardViewProps {
  trainings: Training[];
  trainingOrgs: OrganizationContractor[];
  personnel: Personnel[];
  people: Person[];
  positions: Position[];
  expandedTrainings: Set<string>;
  onToggleExpanded: (trainingId: string) => void;
  onEdit: (trainingId: string) => void;
  onView: (trainingId: string) => void;
  onViewDocuments: (trainingId: string) => void;
  onViewParticipants: (trainingId: string) => void;
  onDuplicate: (trainingId: string) => void;
  onDelete: (trainingId: string) => void;
}



export default function TrainingsCardView({
  trainings,
  trainingOrgs,
  expandedTrainings,
  onToggleExpanded,
  onEdit,
  onView,
  onViewDocuments,
  onViewParticipants,
  onDuplicate,
  onDelete
}: TrainingsCardViewProps) {
  const getOrganizationName = (orgId: string) => {
    const org = trainingOrgs.find(o => o.id === orgId);
    return org?.contractorName || 'Неизвестная организация';
  };

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trainings.map((training) => {
        const isExpanded = expandedTrainings.has(training.id);
        const hasProgress = training.status === 'in_progress' && training.sdoProgress !== undefined;
        
        return (
          <Card key={training.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className={getTrainingTypeColor(training.type)}>
                      {getTrainingTypeLabel(training.type)}
                    </Badge>
                    <Badge className={getTrainingStatusColor(training.status)}>
                      {getTrainingStatusLabel(training.status)}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{training.title}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Icon name="MoreVertical" size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(training.id)}>
                      <Icon name="Eye" size={16} className="mr-2" />
                      Просмотр
                    </DropdownMenuItem>
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

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Calendar" size={14} />
                  <span>{formatDate(training.startDate)} - {formatDate(training.endDate)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Building2" size={14} />
                  <span className="truncate">{getOrganizationName(training.organizationId)}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Users" size={14} />
                  <span>Участников: {training.employeeIds.length}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Wallet" size={14} />
                  <span>{formatCurrency(training.cost)}</span>
                </div>

                {hasProgress && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Прогресс в СДО</span>
                      <span className="font-medium">{training.sdoProgress}%</span>
                    </div>
                    <Progress value={training.sdoProgress} className="h-2" />
                    {training.sdoCompletedLessons !== undefined && training.sdoTotalLessons !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Пройдено уроков: {training.sdoCompletedLessons} из {training.sdoTotalLessons}
                      </p>
                    )}
                  </div>
                )}

                {training.certificateNumber && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Icon name="Award" size={14} />
                      <span className="text-xs font-medium">
                        Удостоверение {training.certificateNumber}
                      </span>
                    </div>
                    {training.certificateIssueDate && (
                      <p className="text-xs text-muted-foreground ml-6">
                        от {formatDate(training.certificateIssueDate)}
                      </p>
                    )}
                  </div>
                )}

                {training.program && isExpanded && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      <strong>Программа:</strong> {training.program}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(training.id)}
                  className="flex-1"
                >
                  <Icon name="Eye" size={14} className="mr-1" />
                  Просмотр
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleExpanded(training.id)}
                  className="flex-1"
                >
                  <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={14} className="mr-1" />
                  {isExpanded ? 'Свернуть' : 'Подробнее'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}