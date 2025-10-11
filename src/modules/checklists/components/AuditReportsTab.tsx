import { useMemo } from 'react';
import { useChecklistsStore } from '@/stores/checklistsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function AuditReportsTab() {
  const { audits, checklists } = useChecklistsStore();

  const stats = useMemo(() => {
    const completedAudits = audits.filter(a => a.status === 'completed');
    
    const totalFindings = completedAudits.reduce((sum, audit) => sum + audit.findings.length, 0);
    const passedFindings = completedAudits.reduce(
      (sum, audit) => sum + audit.findings.filter(f => f.result === 'pass').length, 
      0
    );
    const failedFindings = completedAudits.reduce(
      (sum, audit) => sum + audit.findings.filter(f => f.result === 'fail').length, 
      0
    );

    const averageCompliance = totalFindings > 0 
      ? Math.round((passedFindings / totalFindings) * 100) 
      : 0;

    const criticalIssues = completedAudits.reduce((sum, audit) => {
      const checklist = checklists.find(c => c.id === audit.checklistId);
      if (!checklist) return sum;
      
      return sum + audit.findings.filter(finding => {
        const item = checklist.items.find(i => i.id === finding.itemId);
        return item?.criticalItem && finding.result === 'fail';
      }).length;
    }, 0);

    const checklistStats = checklists.map(checklist => {
      const checklistAudits = completedAudits.filter(a => a.checklistId === checklist.id);
      const checklistFindings = checklistAudits.flatMap(a => a.findings);
      const passed = checklistFindings.filter(f => f.result === 'pass').length;
      const total = checklistFindings.length;
      
      return {
        name: checklist.name,
        auditsCount: checklistAudits.length,
        compliance: total > 0 ? Math.round((passed / total) * 100) : 0
      };
    });

    const monthlyData = completedAudits.reduce((acc, audit) => {
      const month = new Date(audit.completedDate!).toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long' 
      });
      if (!acc[month]) {
        acc[month] = { total: 0, passed: 0, failed: 0 };
      }
      acc[month].total += audit.findings.length;
      acc[month].passed += audit.findings.filter(f => f.result === 'pass').length;
      acc[month].failed += audit.findings.filter(f => f.result === 'fail').length;
      return acc;
    }, {} as Record<string, { total: number; passed: number; failed: number }>);

    return {
      totalAudits: completedAudits.length,
      averageCompliance,
      criticalIssues,
      totalFindings,
      passedFindings,
      failedFindings,
      checklistStats,
      monthlyData
    };
  }, [audits, checklists]);

  const exportReport = () => {
    const csvContent = [
      ['Отчет по аудитам'],
      [''],
      ['Общая статистика'],
      ['Завершено аудитов', stats.totalAudits],
      ['Средняя оценка соответствия', `${stats.averageCompliance}%`],
      ['Критические несоответствия', stats.criticalIssues],
      [''],
      ['Статистика по чек-листам'],
      ['Чек-лист', 'Проведено аудитов', 'Соответствие'],
      ...stats.checklistStats.map(s => [s.name, s.auditsCount, `${s.compliance}%`])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Отчеты и аналитика</h2>
        <Button onClick={exportReport} className="gap-2">
          <Icon name="Download" size={16} />
          Экспорт в CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Завершено аудитов</p>
                <p className="text-3xl font-bold">{stats.totalAudits}</p>
              </div>
              <Icon name="CheckCircle" className="text-green-600" size={40} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Среднее соответствие</p>
                <p className="text-3xl font-bold">{stats.averageCompliance}%</p>
              </div>
              <Icon name="TrendingUp" className="text-blue-600" size={40} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Критические проблемы</p>
                <p className="text-3xl font-bold text-red-600">{stats.criticalIssues}</p>
              </div>
              <Icon name="AlertTriangle" className="text-red-600" size={40} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Всего проверок</p>
                <p className="text-3xl font-bold">{stats.totalFindings}</p>
              </div>
              <Icon name="ListChecks" className="text-purple-600" size={40} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Результаты проверок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="CheckCircle" className="text-green-600" size={24} />
                  <span className="font-medium">Соответствует</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.passedFindings}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="XCircle" className="text-red-600" size={24} />
                  <span className="font-medium">Не соответствует</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{stats.failedFindings}</span>
              </div>

              <div className="h-8 flex rounded-lg overflow-hidden">
                <div 
                  className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${stats.averageCompliance}%` }}
                >
                  {stats.averageCompliance > 10 && `${stats.averageCompliance}%`}
                </div>
                <div 
                  className="bg-red-500 flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${100 - stats.averageCompliance}%` }}
                >
                  {(100 - stats.averageCompliance) > 10 && `${100 - stats.averageCompliance}%`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика по чек-листам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.checklistStats.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Нет завершенных аудитов</p>
              ) : (
                stats.checklistStats.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate flex-1">{item.name}</span>
                      <span className="text-gray-600 ml-2">
                        {item.auditsCount} {item.auditsCount === 1 ? 'аудит' : 'аудитов'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          item.compliance >= 80 ? 'bg-green-500' :
                          item.compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.compliance}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Динамика по месяцам</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.monthlyData).length === 0 ? (
            <p className="text-center text-gray-500 py-8">Нет данных за выбранный период</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats.monthlyData).map(([month, data]) => {
                const compliance = Math.round((data.passed / data.total) * 100);
                return (
                  <div key={month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{month}</span>
                      <span className="text-sm text-gray-600">
                        {data.passed} / {data.total} ({compliance}%)
                      </span>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center px-3 text-white text-xs font-medium"
                        style={{ width: `${compliance}%` }}
                      >
                        {compliance > 15 && `${compliance}%`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
