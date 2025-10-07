import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
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

export default function CompetencyGapAnalysisTab() {
  const user = useAuthStore((state) => state.user);
  const { 
    personnel, 
    competencies, 
    getOrganizationsByTenant,
    getPersonnelByTenant 
  } = useSettingsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterOrg, setFilterOrg] = useState<string>('all');

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
            <div className="flex items-start gap-3">
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
            <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
              <Icon name="Download" size={16} />
              Экспорт
            </Button>
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
