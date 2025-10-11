import { useState } from 'react';
import { useChecklistsStore } from '@/stores/checklistsStore';
import { useTemplatesStore } from '@/stores/templatesStore';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import ChecklistCard from '../components/ChecklistCard';
import ChecklistDialog from '../components/ChecklistDialog';
import ScheduleAuditDialog from '../components/ScheduleAuditDialog';
import AuditDialog from '../components/AuditDialog';
import TemplatesDialog from '../components/TemplatesDialog';
import AuditCard from '../components/AuditCard';
import AuditReportsTab from '../components/AuditReportsTab';
import AuditHistoryTab from '../components/AuditHistoryTab';
import StatsCards from '../components/StatsCards';
import type { Checklist, Audit } from '@/types';

export default function ChecklistsPage() {
  const {
    checklists,
    audits,
    getAuditsByStatus,
    getUpcomingAudits,
    deleteChecklist
  } = useChecklistsStore();

  const [currentTab, setCurrentTab] = useState('checklists');
  const [checklistDialogOpen, setChecklistDialogOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | undefined>();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [conductingAudit, setConductingAudit] = useState<Audit | undefined>();
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);

  const handleCreateChecklist = () => {
    setEditingChecklist(undefined);
    setChecklistDialogOpen(true);
  };

  const handleEditChecklist = (checklist: Checklist) => {
    setEditingChecklist(checklist);
    setChecklistDialogOpen(true);
  };

  const handleDeleteChecklist = (id: string) => {
    if (confirm('Удалить этот чек-лист?')) {
      deleteChecklist(id);
    }
  };

  const handleSaveAsTemplate = (checklist: Checklist) => {
    const templateName = prompt('Введите название шаблона:', checklist.name);
    if (templateName) {
      useTemplatesStore.getState().addCustomTemplate({
        name: templateName,
        category: checklist.category,
        description: `Пользовательский шаблон на основе "${checklist.name}"`,
        items: checklist.items.map(item => ({
          question: item.question,
          requiresComment: item.requiresComment,
          criticalItem: item.criticalItem
        }))
      });
      alert('Шаблон успешно сохранён!');
    }
  };

  const handleConductAudit = (audit: Audit) => {
    setConductingAudit(audit);
  };

  const scheduledAudits = getAuditsByStatus('scheduled');
  const inProgressAudits = getAuditsByStatus('in_progress');
  const completedAudits = getAuditsByStatus('completed');
  const upcomingAudits = getUpcomingAudits();

  return (
    <div>
      <PageHeader
        title="Чек-листы и аудит"
        description="Проведение плановых и внеплановых проверок"
        icon="ClipboardCheck"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setTemplatesDialogOpen(true)}>
              <Icon name="FileText" size={18} />
              Шаблоны
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleCreateChecklist}>
              <Icon name="Plus" size={18} />
              Создать чек-лист
            </Button>
            <Button className="gap-2" onClick={() => setScheduleDialogOpen(true)}>
              <Icon name="Calendar" size={18} />
              Назначить аудит
            </Button>
          </div>
        }
      />

      <StatsCards
        checklistsCount={checklists.length}
        scheduledCount={scheduledAudits.length}
        inProgressCount={inProgressAudits.length}
        completedCount={completedAudits.length}
        upcomingCount={upcomingAudits.length}
      />

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
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="checklists" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="ClipboardCheck" size={20} />
            <span className="text-xs font-medium">Чек-листы ({checklists.length})</span>
          </TabsTrigger>
          <TabsTrigger value="audits" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Search" size={20} />
            <span className="text-xs font-medium">Аудиты ({audits.length})</span>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Calendar" size={20} />
            <span className="text-xs font-medium">Предстоящие ({upcomingAudits.length})</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="BarChart3" size={20} />
            <span className="text-xs font-medium">Отчеты</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="History" size={20} />
            <span className="text-xs font-medium">История</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklists" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {checklists.map((checklist) => (
              <ChecklistCard 
                key={checklist.id} 
                checklist={checklist}
                onEdit={handleEditChecklist}
                onDelete={handleDeleteChecklist}
                onSaveAsTemplate={handleSaveAsTemplate}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audits" className="mt-6">
          <div className="space-y-4">
            {audits.map((audit) => {
              const checklist = checklists.find(c => c.id === audit.checklistId);
              return (
                <AuditCard 
                  key={audit.id} 
                  audit={audit} 
                  checklistName={checklist?.name}
                  onConduct={handleConductAudit}
                />
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

        <TabsContent value="reports" className="mt-6">
          <AuditReportsTab />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <AuditHistoryTab />
        </TabsContent>
      </Tabs>

      <ChecklistDialog
        open={checklistDialogOpen}
        onClose={() => setChecklistDialogOpen(false)}
        checklist={editingChecklist}
      />

      <ScheduleAuditDialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
      />

      {conductingAudit && (
        <AuditDialog
          open={!!conductingAudit}
          onClose={() => setConductingAudit(undefined)}
          audit={conductingAudit}
        />
      )}

      <TemplatesDialog
        open={templatesDialogOpen}
        onClose={() => setTemplatesDialogOpen(false)}
      />
    </div>
  );
}