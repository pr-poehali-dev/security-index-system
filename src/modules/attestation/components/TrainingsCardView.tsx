import { Card, CardContent } from '@/components/ui/card';
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
import type { Training, ExternalOrganization, Personnel, Person, Position } from '@/types';

interface TrainingsCardViewProps {
  trainings: Training[];
  trainingOrgs: ExternalOrganization[];
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
  personnel,
  people,
  positions,
  expandedTrainings,
  onToggleExpanded,
  onEdit,
  onView,
  onViewDocuments,
  onViewParticipants,
  onDuplicate,
  onDelete
}: TrainingsCardViewProps) {
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
    <div className="space-y-3">
      {trainings.map((training) => {
        const org = trainingOrgs.find(o => o.id === training.organizationId);
        const duration = Math.ceil((new Date(training.endDate).getTime() - new Date(training.startDate).getTime()) / (1000 * 60 * 60 * 24));
        const costPerPerson = Math.round(training.cost / training.employeeIds.length);
        
        return (
          <Card key={training.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="GraduationCap" size={18} className="text-muted-foreground" />
                    <h3 className="font-semibold text-lg">{training.title}</h3>
                  </div>
                  <Badge className="mb-3 text-purple-600 bg-purple-100 dark:bg-purple-900/30">
                    {training.type}
                  </Badge>
                  {training.program && (
                    <p className="text-sm text-muted-foreground mb-3">{training.program}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Building2" size={14} />
                      {org?.name || '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Wallet" size={14} />
                      {training.cost.toLocaleString('ru')} ₽ ({costPerPerson.toLocaleString('ru')} ₽/чел)
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      {new Date(training.startDate).toLocaleDateString('ru')} - {new Date(training.endDate).toLocaleDateString('ru')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={14} />
                      {duration} {duration === 1 ? 'день' : duration < 5 ? 'дня' : 'дней'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Users" size={14} />
                      {training.employeeIds.length} чел.
                    </span>
                  </div>
                </div>
                <Badge className={getStatusColor(training.status)}>
                  {getStatusLabel(training.status)}
                </Badge>
              </div>

              {training.status === 'in_progress' && training.sdoProgress !== undefined && (
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Прогресс в СДО ИСП</span>
                    <span className="text-sm font-semibold text-primary">{training.sdoProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all duration-300" 
                      style={{ width: `${training.sdoProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Пройдено уроков: {training.sdoCompletedLessons} из {training.sdoTotalLessons}
                  </p>
                </div>
              )}

              {training.status === 'completed' && training.certificateNumber && (
                <div className="pt-3 border-t bg-emerald-50 dark:bg-emerald-950/20 -mx-4 px-4 pb-3 mt-3">
                  <div className="flex items-start gap-2">
                    <Icon name="Award" size={16} className="text-emerald-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                        Удостоверение о повышении квалификации
                      </p>
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">
                          Номер: <span className="font-semibold">{training.certificateNumber}</span>
                        </p>
                        {training.certificateIssueDate && (
                          <p className="text-xs text-emerald-700 dark:text-emerald-300">
                            Дата выдачи: {new Date(training.certificateIssueDate).toLocaleDateString('ru')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 flex-1 justify-start"
                  onClick={() => onToggleExpanded(training.id)}
                >
                  <Icon 
                    name={expandedTrainings.has(training.id) ? "ChevronDown" : "ChevronRight"} 
                    size={16} 
                  />
                  <span className="text-muted-foreground">Сотрудников:</span>
                  <span className="font-medium">{training.employeeIds.length}</span>
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-2" onClick={() => onEdit(training.id)}>
                    <Icon name="Edit" size={14} />
                    Изменить
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Icon name="MoreVertical" size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(training.id)}>
                        <Icon name="Eye" size={14} className="mr-2" />
                        Просмотр
                      </DropdownMenuItem>
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
              </div>

              {expandedTrainings.has(training.id) && training.participants && training.participants.length > 0 && (
                <div className="pt-3 border-t bg-muted/30">
                  <h4 className="text-sm font-medium mb-3 px-4">Список обучающихся</h4>
                  <div className="space-y-2 px-4 pb-3">
                    {training.participants.map((participant) => {
                      const employeePersonnel = personnel.find(p => p.id === participant.employeeId);
                      const employeePerson = people.find(p => p.id === employeePersonnel?.personId);
                      const employeePosition = positions.find(pos => pos.id === employeePersonnel?.positionId);
                      const fullName = employeePerson ? `${employeePerson.lastName} ${employeePerson.firstName} ${employeePerson.middleName || ''}`.trim() : 'Неизвестный сотрудник';

                      return (
                        <div key={participant.employeeId} className="bg-background rounded-lg p-3 border">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{fullName}</p>
                              {employeePosition && (
                                <p className="text-xs text-muted-foreground">{employeePosition.name}</p>
                              )}
                            </div>
                            <Badge className={
                              participant.status === 'completed' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : participant.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }>
                              {participant.status === 'completed' ? 'Обучение завершено' : 
                               participant.status === 'in_progress' ? 'Обучается' : 'Не завершено'}
                            </Badge>
                          </div>
                          
                          {participant.progress !== undefined && (
                            <div className="mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">Прогресс</span>
                                <span className="text-xs font-medium">{participant.progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div 
                                  className="bg-primary rounded-full h-1.5 transition-all" 
                                  style={{ width: `${participant.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {participant.testScore !== undefined && participant.testMaxScore && (
                            <div className="flex items-center gap-2 text-xs">
                              <Icon name="ClipboardCheck" size={12} className="text-muted-foreground" />
                              <span className="text-muted-foreground">Итоговый тест:</span>
                              <span className="font-semibold">
                                {participant.testScore} из {participant.testMaxScore}
                              </span>
                            </div>
                          )}

                          {participant.completedAt && (
                            <div className="flex items-center gap-2 text-xs mt-1">
                              <Icon name="Calendar" size={12} className="text-muted-foreground" />
                              <span className="text-muted-foreground">Завершено:</span>
                              <span>{new Date(participant.completedAt).toLocaleDateString('ru')}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
