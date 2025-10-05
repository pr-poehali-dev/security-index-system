import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const works = [
  { id: '1', object: 'Котельная №1', type: 'ТО', title: 'Плановое ТО №3', scheduled: '2025-10-10', status: 'planned', executor: 'Внутренняя служба' },
  { id: '2', object: 'ГТС-01', type: 'Ремонт', title: 'Ремонт затвора №2', scheduled: '2025-10-08', status: 'in_progress', executor: 'ООО "РемСервис"' },
  { id: '3', object: 'Подстанция А', type: 'ТО', title: 'ТО трансформатора', scheduled: '2025-09-25', status: 'completed', executor: 'Внутренняя служба' }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planned': return 'bg-blue-100 text-blue-700';
    case 'in_progress': return 'bg-amber-100 text-amber-700';
    case 'completed': return 'bg-emerald-100 text-emerald-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'ТО': return 'bg-green-100 text-green-700';
    case 'Ремонт': return 'bg-orange-100 text-orange-700';
    case 'Замена': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function MaintenancePage() {
  return (
    <div>
      <PageHeader
        title="Ремонты и обслуживание"
        description="Планирование и учет работ по ТО и ремонтам"
        icon="Wrench"
        action={
          <Button className="gap-2">
            <Icon name="Plus" size={18} />
            Создать заявку
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Calendar" className="text-blue-600" size={24} />
              <span className="text-2xl font-bold">12</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Запланировано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Wrench" className="text-amber-600" size={24} />
              <span className="text-2xl font-bold">5</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">В работе</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
              <span className="text-2xl font-bold">28</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Завершено</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Clock" className="text-purple-600" size={24} />
              <span className="text-2xl font-bold">3</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Просрочено</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="TrendingUp" className="text-blue-600" size={24} />
              <span className="text-2xl font-bold">92%</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Выполнение</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {works.map((work) => (
          <Card key={work.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{work.title}</h3>
                    <Badge className={getTypeColor(work.type)}>{work.type}</Badge>
                    <Badge className={getStatusColor(work.status)}>
                      {work.status === 'planned' ? 'Запланировано' : work.status === 'in_progress' ? 'В работе' : 'Завершено'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Icon name="Building" size={14} />
                      <span>{work.object}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      <span>{new Date(work.scheduled).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="User" size={14} />
                      <span>{work.executor}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Icon name="Eye" className="mr-2" size={14} />
                  Подробнее
                </Button>
                {work.status === 'planned' && (
                  <Button size="sm">
                    <Icon name="Play" className="mr-2" size={14} />
                    Начать работу
                  </Button>
                )}
                {work.status === 'in_progress' && (
                  <Button size="sm">
                    <Icon name="Check" className="mr-2" size={14} />
                    Завершить
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
