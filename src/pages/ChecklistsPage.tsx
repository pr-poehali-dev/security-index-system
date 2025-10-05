import { useState } from 'react';
import { useChecklistsStore } from '@/stores/checklistsStore';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type { Checklist, Audit } from '@/types';

export default function ChecklistsPage() {
  const {
    checklists,
    audits,
    selectedChecklist,
    selectedAudit,
    selectChecklist,
    selectAudit,
    getAuditsByStatus,
    getUpcomingAudits
  } = useChecklistsStore();

  const [currentTab, setCurrentTab] = useState('checklists');

  const scheduledAudits = getAuditsByStatus('scheduled');
  const inProgressAudits = getAuditsByStatus('in_progress');
  const completedAudits = getAuditsByStatus('completed');
  const upcomingAudits = getUpcomingAudits();

  const getPassRate = (audit: Audit) => {
    if (audit.findings.length === 0) return 0;
    const passed = audit.findings.filter(f => f.result === 'pass').length;
    return Math.round((passed / audit.findings.length) * 100);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fire_safety': return 'Flame';
      case 'equipment': return 'Cog';
      case 'ppe': return 'ShieldCheck';
      default: return 'FileText';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'fire_safety': return 'Пожарная безопасность';
      case 'equipment': return 'Оборудование';
      case 'ppe': return 'СИЗ';
      default: return category;
    }
  };

  const getStatusColor = (status: Audit['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
    }
  };

  const getStatusLabel = (status: Audit['status']) => {
    switch (status) {
      case 'scheduled': return 'Запланирован';
      case 'in_progress': return 'В процессе';
      case 'completed': return 'Завершен';
    }
  };

  return (
    <div>
      <PageHeader
        title="Чек-листы и аудит"
        description="Проведение плановых и внеплановых проверок"
        icon="ClipboardCheck"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Icon name="Plus" size={18} />
              Создать чек-лист
            </Button>
            <Button className="gap-2">
              <Icon name="Calendar" size={18} />
              Назначить аудит
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="FileText" className="text-gray-600" size={24} />
              <span className="text-3xl font-bold">{checklists.length}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Шаблонов</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Calendar" className="text-blue-600" size={24} />
              <span className="text-3xl font-bold">{scheduledAudits.length}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Запланировано</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Play" className="text-purple-600" size={24} />
              <span className="text-3xl font-bold">{inProgressAudits.length}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">В процессе</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle2" className="text-green-600" size={24} />
              <span className="text-3xl font-bold">{completedAudits.length}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Завершено</p>
          </CardContent>
        </Card>

        <Card className={upcomingAudits.length > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Bell" className="text-yellow-600" size={24} />
              <span className="text-3xl font-bold text-yellow-600">{upcomingAudits.length}</span>
            </div>
            <p className="text-sm text-yellow-600 font-medium">Скоро</p>
          </CardContent>
        </Card>
      </div>

      {upcomingAudits.length > 0 && (
        <Card className="mb-6 border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Icon name="Bell" className="text-yellow-600" size={24} />
              <div>
                <p className="font-semibold text-yellow-900">Предстоящие аудиты</p>
                <p className="text-sm text-yellow-700">
                  {upcomingAudits.length} аудитов запланировано в ближайшие 30 дней
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="checklists">Чек-листы ({checklists.length})</TabsTrigger>
          <TabsTrigger value="audits">Аудиты ({audits.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Предстоящие ({upcomingAudits.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="checklists" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {checklists.map((checklist) => (
              <Card key={checklist.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Icon name={getCategoryIcon(checklist.category)} className="text-blue-600 mt-1" size={24} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{checklist.name}</h3>
                      <Badge variant="outline">{getCategoryLabel(checklist.category)}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Всего пунктов:</span>
                      <span className="font-medium">{checklist.items.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Критических:</span>
                      <span className="font-medium text-red-600">
                        {checklist.items.filter(i => i.criticalItem).length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {checklist.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-start gap-2 text-sm">
                        <Icon 
                          name={item.criticalItem ? "AlertCircle" : "Circle"} 
                          size={14} 
                          className={item.criticalItem ? "text-red-500 mt-0.5" : "text-gray-400 mt-0.5"} 
                        />
                        <span className="text-gray-700 line-clamp-1">{item.question}</span>
                      </div>
                    ))}
                    {checklist.items.length > 3 && (
                      <p className="text-xs text-gray-500 pl-6">
                        +{checklist.items.length - 3} ещё
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Icon name="Eye" className="mr-2" size={14} />
                      Просмотр
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Icon name="Play" className="mr-2" size={14} />
                      Провести
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audits" className="mt-6">
          <div className="space-y-4">
            {audits.map((audit) => {
              const checklist = checklists.find(c => c.id === audit.checklistId);
              const passRate = getPassRate(audit);

              return (
                <Card key={audit.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{checklist?.name}</h3>
                          <Badge className={getStatusColor(audit.status)}>
                            {getStatusLabel(audit.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Icon name="Calendar" size={14} />
                            <span>Запланирован: {new Date(audit.scheduledDate).toLocaleDateString('ru-RU')}</span>
                          </div>
                          {audit.completedDate && (
                            <div className="flex items-center gap-1">
                              <Icon name="CheckCircle2" size={14} className="text-green-600" />
                              <span>Завершен: {new Date(audit.completedDate).toLocaleDateString('ru-RU')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {audit.status === 'completed' && (
                        <div className="text-right">
                          <div className="text-3xl font-bold mb-1">{passRate}%</div>
                          <p className="text-xs text-gray-600">соответствие</p>
                        </div>
                      )}
                    </div>

                    {audit.findings.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Результаты проверки:</h4>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="p-2 bg-green-50 rounded text-center">
                            <Icon name="CheckCircle2" className="mx-auto mb-1 text-green-600" size={20} />
                            <p className="text-xs text-gray-600">Соответствует</p>
                            <p className="font-bold text-green-700">
                              {audit.findings.filter(f => f.result === 'pass').length}
                            </p>
                          </div>
                          <div className="p-2 bg-red-50 rounded text-center">
                            <Icon name="XCircle" className="mx-auto mb-1 text-red-600" size={20} />
                            <p className="text-xs text-gray-600">Не соответствует</p>
                            <p className="font-bold text-red-700">
                              {audit.findings.filter(f => f.result === 'fail').length}
                            </p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded text-center">
                            <Icon name="Minus" className="mx-auto mb-1 text-gray-600" size={20} />
                            <p className="text-xs text-gray-600">Не применимо</p>
                            <p className="font-bold text-gray-700">
                              {audit.findings.filter(f => f.result === 'n/a').length}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Icon name="Eye" className="mr-2" size={14} />
                        Подробнее
                      </Button>
                      {audit.status === 'scheduled' && (
                        <Button size="sm" variant="secondary">
                          <Icon name="Play" className="mr-2" size={14} />
                          Начать проверку
                        </Button>
                      )}
                      {audit.status === 'in_progress' && (
                        <Button size="sm">
                          <Icon name="Save" className="mr-2" size={14} />
                          Продолжить
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-4">
            {upcomingAudits.map((audit) => {
              const checklist = checklists.find(c => c.id === audit.checklistId);
              const daysUntil = Math.ceil(
                (new Date(audit.scheduledDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <Card key={audit.id} className="border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon name="Bell" className="text-yellow-600 mt-1" size={24} />
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{checklist?.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Icon name="Calendar" size={14} />
                              <span>{new Date(audit.scheduledDate).toLocaleDateString('ru-RU')}</span>
                            </div>
                            <Badge variant="outline" className={daysUntil <= 7 ? 'border-red-300 text-red-600' : ''}>
                              Через {daysUntil} {daysUntil === 1 ? 'день' : 'дней'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button size="sm">
                        Подготовиться
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {upcomingAudits.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="Calendar" className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-500">Нет предстоящих аудитов</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
