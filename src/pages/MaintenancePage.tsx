import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function MaintenancePage() {
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
              <Icon name="Clock" className="text-amber-600" size={24} />
              <span className="text-2xl font-bold">5</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">В процессе</p>
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
              <Icon name="Wallet" className="text-purple-600" size={24} />
              <span className="text-2xl font-bold">2.4M</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Затраты (₽)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="TrendingDown" className="text-green-600" size={24} />
              <span className="text-2xl font-bold">18ч</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ср. простой</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>График работ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {works.map((work) => (
              <div key={work.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{work.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{work.object}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(work.type)}>{work.type}</Badge>
                    <Badge className={getStatusColor(work.status)}>
                      {work.status === 'planned' ? 'Запланировано' : work.status === 'in_progress' ? 'В работе' : 'Завершено'}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" size={14} className="text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {new Date(work.scheduled).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={14} className="text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">{work.executor}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Icon name="Eye" className="mr-1" size={14} />
                    Просмотр
                  </Button>
                  {work.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <Icon name="FileText" size={14} className="mr-1" />
                      Акт
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
