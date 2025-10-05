import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import CreateExaminationDialog from '../components/CreateExaminationDialog';
import ExaminationDetailsDialog from '../components/ExaminationDetailsDialog';
import UploadConclusionDialog from '../components/UploadConclusionDialog';

const examinations = [
  { id: '1', object: 'Котельная №1', type: 'Экспертиза ПБ', scheduled: '2025-11-15', status: 'scheduled', executor: 'ООО "Эксперт"' },
  { id: '2', object: 'ГТС-01', type: 'Тех. диагностирование', scheduled: '2025-10-20', status: 'in_progress', executor: 'ООО "Диагностика"' },
  { id: '3', object: 'Подстанция А', type: 'Испытания', scheduled: '2025-09-30', status: 'completed', executor: 'ООО "Энергосервис"' }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-700';
    case 'in_progress': return 'bg-amber-100 text-amber-700';
    case 'completed': return 'bg-emerald-100 text-emerald-700';
    case 'overdue': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    scheduled: 'Запланировано',
    in_progress: 'В процессе',
    completed: 'Завершено',
    overdue: 'Просрочено'
  };
  return labels[status] || status;
};

export default function ExaminationPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedExamination, setSelectedExamination] = useState<typeof examinations[0] | null>(null);

  const handleViewDetails = (exam: typeof examinations[0]) => {
    setSelectedExamination(exam);
    setDetailsDialogOpen(true);
  };

  const handleUploadConclusion = (exam: typeof examinations[0]) => {
    setSelectedExamination(exam);
    setUploadDialogOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Техническое диагностирование"
        description="Планирование и учет экспертиз и диагностирований"
        icon="Microscope"
        action={
          <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
            <Icon name="Plus" size={18} />
            Запланировать диагностирование
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Calendar" className="text-blue-600" size={24} />
              <span className="text-2xl font-bold">8</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Запланировано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Activity" className="text-amber-600" size={24} />
              <span className="text-2xl font-bold">3</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">В процессе</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
              <span className="text-2xl font-bold">42</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Завершено</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="AlertTriangle" className="text-red-600" size={24} />
              <span className="text-2xl font-bold">1</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Просрочено</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {examinations.map((exam) => (
          <Card key={exam.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{exam.type}</h3>
                    <Badge className={getStatusColor(exam.status)}>
                      {getStatusLabel(exam.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Icon name="Building" size={14} />
                      <span>{exam.object}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      <span>{new Date(exam.scheduled).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="User" size={14} />
                      <span>{exam.executor}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(exam)}>
                  <Icon name="Eye" className="mr-2" size={14} />
                  Подробнее
                </Button>
                {exam.status === 'scheduled' && (
                  <Button size="sm">
                    <Icon name="Play" className="mr-2" size={14} />
                    Начать
                  </Button>
                )}
                {exam.status === 'in_progress' && (
                  <Button size="sm" onClick={() => handleUploadConclusion(exam)}>
                    <Icon name="Upload" className="mr-2" size={14} />
                    Загрузить заключение
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateExaminationDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ExaminationDetailsDialog 
        open={detailsDialogOpen} 
        onOpenChange={setDetailsDialogOpen}
        examination={selectedExamination}
      />
      <UploadConclusionDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        examination={selectedExamination}
      />
    </div>
  );
}