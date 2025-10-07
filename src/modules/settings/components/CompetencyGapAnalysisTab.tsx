import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTaskStore } from '@/stores/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useState, useMemo } from 'react';
import { analyzePersonnelCompetencies, getRiskLevelColor, getRiskLevelLabel } from '@/lib/competencyAnalysis';
import { CERTIFICATION_CATEGORIES } from '@/lib/constants';
import { exportToExcel } from '@/lib/exportUtils';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function CompetencyGapAnalysisTab() {
  const user = useAuthStore((state) => state.user);
  const { 
    personnel, 
    competencies, 
    getOrganizationsByTenant,
    getPersonnelByTenant 
  } = useSettingsStore();
  const addTask = useTaskStore((state) => state.addTask);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [isCreatingBulk, setIsCreatingBulk] = useState(false);

  const organizations = user?.tenantId ? getOrganizationsByTenant(user.tenantId) : [];
  const tenantPersonnel = user?.tenantId ? getPersonnelByTenant(user.tenantId) : [];

  const report = useMemo(() => {
    return analyzePersonnelCompetencies(tenantPersonnel, competencies, organizations);
  }, [tenantPersonnel, competencies, organizations]);

  const filteredGaps = report.gaps.filter((gap) => {
    const matchesSearch = 
      gap.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gap.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gap.organizationName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = filterRisk === 'all' || gap.riskLevel === filterRisk;
    const matchesOrg = filterOrg === 'all' || gap.organizationId === filterOrg;

    return matchesSearch && matchesRisk && matchesOrg;
  });

  const handleExport = () => {
    const data = filteredGaps.map((gap) => {
      const missingAreasText = gap.missingAreas.map((miss) => {
        const category = CERTIFICATION_CATEGORIES.find((c) => c.value === miss.category);
        return `${category?.label}: ${miss.areas.join(', ')}`;
      }).join(' | ');

      return {
        'Сотрудник': gap.fullName,
        'Должность': gap.position,
        'Организация': gap.organizationName,
        'Уровень риска': getRiskLevelLabel(gap.riskLevel),
        'Процент соответствия': `${gap.completionRate}%`,
        'Отсутствующие области': missingAreasText || 'Нет требований',
        'Дата проверки': new Date(gap.lastChecked).toLocaleDateString('ru-RU')
      };
    });

    exportToExcel(data, 'Анализ_пробелов_компетенций');
  };

  const handleCreateTask = (gap: typeof report.gaps[0]) => {
    if (!user?.id || !user?.tenantId || gap.missingAreas.length === 0) return;

    const employee = personnel.find((p) => p.id === gap.employeeId);
    if (!employee) return;

    const missingAreasText = gap.missingAreas.map((miss) => {
      const category = CERTIFICATION_CATEGORIES.find((c) => c.value === miss.category);
      return `${category?.label} (${category?.code}): ${miss.areas.join(', ')}`;
    }).join('\n');

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const taskId = addTask({
      tenantId: user.tenantId,
      title: `Аттестация: ${gap.fullName}`,
      description: `Необходимо провести аттестацию сотрудника по следующим областям:\n\n${missingAreasText}\n\nСотрудник: ${gap.fullName}\nДолжность: ${gap.position}\nОрганизация: ${gap.organizationName}\nУровень риска: ${getRiskLevelLabel(gap.riskLevel)}\nТекущее соответствие: ${gap.completionRate}%`,
      priority: gap.riskLevel === 'critical' ? 'critical' : gap.riskLevel === 'high' ? 'high' : 'medium',
      status: 'new',
      type: 'certification',
      source: 'certification',
      sourceId: gap.employeeId,
      createdBy: user.id,
      createdByName: user.fullName,
      dueDate: dueDate.toISOString(),
      objectId: gap.organizationId,
      objectName: gap.organizationName,
      comments: [],
      attachments: [],
      timeline: [
        {
          id: crypto.randomUUID(),
          taskId: taskId,
          eventType: 'created',
          description: 'Задача создана из анализа пробелов компетенций',
          userId: user.id,
          userName: user.fullName,
          createdAt: new Date().toISOString()
        }
      ]
    });

    toast.success('Задача на аттестацию создана', {
      description: `Создана задача для аттестации ${gap.fullName}`
    });
  };

  const handleCreateBulkTasks = (riskLevel: 'critical' | 'high' | 'all') => {
    if (!user?.id || !user?.tenantId || isCreatingBulk) return;

    const gapsToProcess = report.gaps.filter((gap) => {
      if (gap.missingAreas.length === 0) return false;
      if (riskLevel === 'all') return gap.riskLevel === 'critical' || gap.riskLevel === 'high';
      return gap.riskLevel === riskLevel;
    });

    if (gapsToProcess.length === 0) {
      toast.info('Нет сотрудников для создания задач', {
        description: 'Все сотрудники соответствуют требованиям или задачи уже созданы'
      });
      return;
    }

    setIsCreatingBulk(true);

    let successCount = 0;
    let errorCount = 0;

    gapsToProcess.forEach((gap) => {
      try {
        const employee = personnel.find((p) => p.id === gap.employeeId);
        if (!employee) {
          errorCount++;
          return;
        }

        const missingAreasText = gap.missingAreas.map((miss) => {
          const category = CERTIFICATION_CATEGORIES.find((c) => c.value === miss.category);
          return `${category?.label} (${category?.code}): ${miss.areas.join(', ')}`;
        }).join('\n');

        const dueDate = new Date();
        if (gap.riskLevel === 'critical') {
          dueDate.setDate(dueDate.getDate() + 14);
        } else if (gap.riskLevel === 'high') {
          dueDate.setDate(dueDate.getDate() + 30);
        } else {
          dueDate.setDate(dueDate.getDate() + 60);
        }

        const taskId = addTask({
          tenantId: user.tenantId,
          title: `Аттестация: ${gap.fullName}`,
          description: `Необходимо провести аттестацию сотрудника по следующим областям:\n\n${missingAreasText}\n\nСотрудник: ${gap.fullName}\nДолжность: ${gap.position}\nОрганизация: ${gap.organizationName}\nУровень риска: ${getRiskLevelLabel(gap.riskLevel)}\nТекущее соответствие: ${gap.completionRate}%`,
          priority: gap.riskLevel === 'critical' ? 'critical' : gap.riskLevel === 'high' ? 'high' : 'medium',
          status: 'new',
          type: 'certification',
          source: 'certification',
          sourceId: gap.employeeId,
          createdBy: user.id,
          createdByName: user.fullName,
          dueDate: dueDate.toISOString(),
          objectId: gap.organizationId,
          objectName: gap.organizationName,
          comments: [],
          attachments: [],
          timeline: [
            {
              id: crypto.randomUUID(),
              taskId: taskId,
              eventType: 'created',
              description: 'Задача создана массово из анализа пробелов компетенций',
              userId: user.id,
              userName: user.fullName,
              createdAt: new Date().toISOString()
            }
          ]
        });

        successCount++;
      } catch (error) {
        errorCount++;
        console.error('Ошибка создания задачи для:', gap.fullName, error);
      }
    });

    setIsCreatingBulk(false);

    if (successCount > 0) {
      toast.success(`Создано задач: ${successCount}`, {
        description: errorCount > 0 
          ? `Успешно создано ${successCount} задач. Ошибок: ${errorCount}`
          : `Успешно создано ${successCount} задач на аттестацию`
      });
    } else {
      toast.error('Не удалось создать задачи', {
        description: 'Проверьте данные и попробуйте снова'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего сотрудников</p>
                <p className="text-2xl font-bold">{report.totalPersonnel}</p>
              </div>
              <Icon name="Users" size={32} className="text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Соответствуют</p>
                <p className="text-2xl font-bold text-green-600">{report.compliantPersonnel}</p>
              </div>
              <Icon name="CheckCircle2" size={32} className="text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Не соответствуют</p>
                <p className="text-2xl font-bold text-red-600">{report.nonCompliantPersonnel}</p>
              </div>
              <Icon name="AlertTriangle" size={32} className="text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Уровень соответствия</p>
                <p className="text-2xl font-bold">{report.complianceRate}%</p>
              </div>
              <Icon name="TrendingUp" size={32} className="text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {report.criticalGaps > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <Icon name="AlertCircle" className="text-red-600 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-200">
                    Критические пробелы: {report.criticalGaps} сотрудников
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                    Требуется срочная аттестация. Соответствие менее 50%.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleCreateBulkTasks('critical')}
                disabled={isCreatingBulk}
                size="sm"
                variant="destructive"
                className="gap-2 flex-shrink-0"
              >
                <Icon name="ListChecks" size={16} />
                {isCreatingBulk ? 'Создание...' : 'Создать задачи'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Аналитика по организациям</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.byOrganization.map((org) => (
              <div key={org.organizationId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{org.organizationName}</p>
                    <p className="text-sm text-muted-foreground">
                      {org.compliant} из {org.totalPersonnel} сотрудников
                    </p>
                  </div>
                  <Badge variant={org.complianceRate >= 80 ? 'default' : 'destructive'}>
                    {Math.round(org.complianceRate)}%
                  </Badge>
                </div>
                <Progress value={org.complianceRate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {report.byCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Наиболее отсутствующие области аттестации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.byCategory.map((cat) => {
                const category = CERTIFICATION_CATEGORIES.find((c) => c.value === cat.category);
                return (
                  <div key={cat.category} className="space-y-2">
                    <h4 className="font-medium">
                      {category?.label} ({category?.code})
                    </h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {cat.mostMissingAreas.map((area) => (
                        <div
                          key={area.code}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                        >
                          <span className="text-sm">{area.code}</span>
                          <Badge variant="secondary">{area.count} чел.</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Детальный анализ пробелов</CardTitle>
            <div className="flex items-center gap-2">
              {report.gaps.filter(g => g.missingAreas.length > 0 && (g.riskLevel === 'critical' || g.riskLevel === 'high')).length > 0 && (
                <Button 
                  onClick={() => handleCreateBulkTasks('all')} 
                  disabled={isCreatingBulk}
                  variant="default" 
                  size="sm" 
                  className="gap-2"
                >
                  <Icon name="ListChecks" size={16} />
                  {isCreatingBulk ? 'Создание...' : 'Создать все задачи'}
                </Button>
              )}
              <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
                <Icon name="Download" size={16} />
                Экспорт
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Поиск по ФИО или должности..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger>
                <SelectValue placeholder="Фильтр по риску" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все уровни риска</SelectItem>
                <SelectItem value="critical">Критический</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterOrg} onValueChange={setFilterOrg}>
              <SelectTrigger>
                <SelectValue placeholder="Фильтр по организации" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все организации</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredGaps.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Search" size={48} className="mx-auto mb-4 opacity-20" />
                <p>Нет данных по выбранным фильтрам</p>
              </div>
            ) : (
              filteredGaps.map((gap) => (
                <Card key={gap.employeeId} className={`border-l-4 ${getRiskLevelColor(gap.riskLevel)}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{gap.fullName}</h3>
                            <Badge variant={gap.hasAllRequired ? 'default' : 'destructive'}>
                              {getRiskLevelLabel(gap.riskLevel)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{gap.position}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Icon name="Building2" size={14} />
                            {gap.organizationName}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              Уровень соответствия: {gap.completionRate}%
                            </span>
                          </div>
                          <Progress value={gap.completionRate} className="h-2" />
                        </div>

                        {gap.missingAreas.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">
                              Отсутствующие области аттестации:
                            </p>
                            {gap.missingAreas.map((miss, idx) => {
                              const category = CERTIFICATION_CATEGORIES.find((c) => c.value === miss.category);
                              return (
                                <div key={idx} className="space-y-1">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {category?.label} ({category?.code})
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {miss.areas.map((area, aIdx) => (
                                      <Badge key={aIdx} variant="destructive" className="text-xs">
                                        {area}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Icon name="CheckCircle2" size={16} />
                            <span className="text-sm font-medium">
                              Соответствует всем требованиям
                            </span>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Проверено: {new Date(gap.lastChecked).toLocaleString('ru-RU')}
                        </div>
                      </div>
                      
                      {gap.missingAreas.length > 0 && (
                        <div className="flex-shrink-0">
                          <Button
                            onClick={() => handleCreateTask(gap)}
                            size="sm"
                            variant="default"
                            className="gap-2"
                          >
                            <Icon name="Plus" size={16} />
                            Создать задачу
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}