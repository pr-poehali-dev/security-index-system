import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function ExaminationPage() {
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

  return (
    <div>
      <PageHeader
        title="Техническое диагностирование"
        description="Планирование и учет экспертиз и диагностирований"
        icon="Microscope"
        action={
          <Button className="gap-2">
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
              <Icon name="Clock" className="text-amber-600" size={24} />
              <span className="text-2xl font-bold">3</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">В процессе</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
              <span className="text-2xl font-bold">15</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Завершено</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="TrendingUp" className="text-green-600" size={24} />
              <span className="text-2xl font-bold">94%</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Соответствие</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>График диагностирований</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {examinations.map((exam) => (
              <div key={exam.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{exam.object}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{exam.type}</p>
                  </div>
                  <Badge className={getStatusColor(exam.status)}>
                    {getStatusLabel(exam.status)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" size={14} className="text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {new Date(exam.scheduled).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Building2" size={14} className="text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">{exam.executor}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Icon name="Eye" className="mr-1" size={14} />
                    Просмотр
                  </Button>
                  {exam.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <Icon name="FileText" size={14} className="mr-1" />
                      Отчет
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
