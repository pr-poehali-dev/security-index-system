import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

export default function ChecklistsPage() {
  const checklists = [
    { id: '1', name: 'Проверка котельной', category: 'ОПО', inspections: 12, avgCompliance: 92 },
    { id: '2', name: 'Проверка ГТС', category: 'ГТС', inspections: 8, avgCompliance: 88 },
    { id: '3', name: 'Проверка электрооборудования', category: 'Энергетика', inspections: 15, avgCompliance: 95 }
  ];

  const recentInspections = [
    { id: '1', checklist: 'Проверка котельной', object: 'Котельная №1', date: '2025-10-03', compliance: 95, status: 'completed' },
    { id: '2', checklist: 'Проверка ГТС', object: 'ГТС-01', date: '2025-10-02', compliance: 85, status: 'completed' },
    { id: '3', checklist: 'Проверка электрооборудования', object: 'Подстанция А', date: '2025-10-01', compliance: 100, status: 'completed' }
  ];

  return (
    <div>
      <PageHeader
        title="Чек-листы и аудит"
        description="Проведение плановых и внеплановых проверок"
        icon="ClipboardCheck"
        action={
          <Button className="gap-2">
            <Icon name="Plus" size={18} />
            Создать чек-лист
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="FileText" className="text-blue-600" size={24} />
              <span className="text-2xl font-bold">{checklists.length}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Шаблонов чек-листов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle" className="text-emerald-600" size={24} />
              <span className="text-2xl font-bold">35</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Проверок выполнено</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="TrendingUp" className="text-green-600" size={24} />
              <span className="text-2xl font-bold">91%</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Средний % соответствия</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Шаблоны чек-листов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklists.map((checklist) => (
                <div key={checklist.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{checklist.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{checklist.category}</p>
                    </div>
                    <Badge variant="outline">{checklist.inspections} проверок</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Соответствие</span>
                      <span>{checklist.avgCompliance}%</span>
                    </div>
                    <Progress value={checklist.avgCompliance} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Последние проверки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInspections.map((inspection) => (
                <div key={inspection.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">{inspection.checklist}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{inspection.object}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      {inspection.compliance}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Icon name="Calendar" size={12} />
                    <span>{new Date(inspection.date).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
