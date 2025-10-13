import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ViewModeToggle } from '@/components/ui/view-mode-toggle';
import type { Training } from '@/stores/attestationStore';
import type { Personnel, Person, Position, OrganizationContractor } from '@/stores/settingsStore';
import TrainingsStats from './TrainingsStats';
import TrainingsCardView from './TrainingsCardView';
import TrainingsTableView from './TrainingsTableView';
import TrainingFilters from './TrainingFilters';

interface TrainingsTabProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  trainingStatusFilter: string;
  setTrainingStatusFilter: (value: string) => void;
  trainingViewMode: 'cards' | 'table';
  setTrainingViewMode: (mode: 'cards' | 'table') => void;
  filteredTrainings: Training[];
  trainingOrgs: OrganizationContractor[];
  personnel: Personnel[];
  people: Person[];
  positions: Position[];
  expandedTrainings: Set<string>;
  trainingStats: {
    total: number;
    planned: number;
    inProgress: number;
    totalCost: number;
  };
  onToggleExpanded: (trainingId: string) => void;
  onEdit: (trainingId: string) => void;
  onView: (trainingId: string) => void;
  onViewDocuments: (trainingId: string) => void;
  onViewParticipants: (trainingId: string) => void;
  onDuplicate: (trainingId: string) => void;
  onDelete: (trainingId: string) => void;
  onExportToExcel: () => void;
  onCreateTraining: () => void;
}

export default function TrainingsTab({
  searchQuery,
  setSearchQuery,
  trainingStatusFilter,
  setTrainingStatusFilter,
  trainingViewMode,
  setTrainingViewMode,
  filteredTrainings,
  trainingOrgs,
  personnel,
  people,
  positions,
  expandedTrainings,
  trainingStats,
  onToggleExpanded,
  onEdit,
  onView,
  onViewDocuments,
  onViewParticipants,
  onDuplicate,
  onDelete,
  onExportToExcel,
  onCreateTraining
}: TrainingsTabProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Icon name="Construction" size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Раздел находится в разработке
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Функционал планирования и управления обучениями находится в стадии разработки. 
                В ближайшее время здесь появится возможность планировать обучения, отслеживать прогресс 
                и получать данные из СДО и учебных центров в автоматическом режиме.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <TrainingsStats
        total={trainingStats.total}
        planned={trainingStats.planned}
        inProgress={trainingStats.inProgress}
        totalCost={trainingStats.totalCost}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Список обучений</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <ViewModeToggle
                value={trainingViewMode}
                onChange={setTrainingViewMode}
                modes={['cards', 'table']}
              />
              <Button variant="outline" onClick={onExportToExcel} className="gap-2">
                <Icon name="Download" size={16} />
                Экспорт
              </Button>
              <Button onClick={onCreateTraining} className="gap-2">
                <Icon name="Plus" size={16} />
                Запланировать обучение
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <TrainingFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              trainingStatusFilter={trainingStatusFilter}
              setTrainingStatusFilter={setTrainingStatusFilter}
            />
          </div>

          {trainingViewMode === 'cards' ? (
            <TrainingsCardView
              trainings={filteredTrainings}
              trainingOrgs={trainingOrgs}
              personnel={personnel}
              people={people}
              positions={positions}
              expandedTrainings={expandedTrainings}
              onToggleExpanded={onToggleExpanded}
              onEdit={onEdit}
              onView={onView}
              onViewDocuments={onViewDocuments}
              onViewParticipants={onViewParticipants}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ) : (
            <TrainingsTableView
              trainings={filteredTrainings}
              trainingOrgs={trainingOrgs}
              onView={onView}
              onEdit={onEdit}
              onViewDocuments={onViewDocuments}
              onViewParticipants={onViewParticipants}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          )}

          <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Интеграция с СДО и учебными центрами
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    Система автоматически отслеживает прогресс обучения в СДО «Интеллектуальные системы подготовки» 
                    и получает данные об удостоверениях из учебных центров.
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-4">
                    <li>• Обучения со статусом "В процессе" показывают прогресс в СДО</li>
                    <li>• Завершённые обучения отображают номер и дату выдачи удостоверения</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}