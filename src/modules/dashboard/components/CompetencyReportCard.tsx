import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { CompetencyGapReport } from '@/types';

interface CompetencyReportCardProps {
  report: CompetencyGapReport;
  onNavigate: () => void;
}

export default function CompetencyReportCard({ report, onNavigate }: CompetencyReportCardProps) {
  return (
    <Card className="mb-6 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="GraduationCap" size={20} className="text-purple-600" />
            Анализ компетенций персонала
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onNavigate}
            className="gap-2"
          >
            Подробнее
            <Icon name="ArrowRight" size={14} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Icon name="Users" size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{report.totalPersonnel}</p>
              <p className="text-xs text-muted-foreground">Сотрудников</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Icon name="CheckCircle2" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{report.compliantPersonnel}</p>
              <p className="text-xs text-muted-foreground">Соответствуют</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <Icon name="AlertTriangle" size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{report.criticalGaps}</p>
              <p className="text-xs text-muted-foreground">Критических</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Icon name="TrendingUp" size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{report.complianceRate}%</p>
              <p className="text-xs text-muted-foreground">Соответствие</p>
            </div>
          </div>
        </div>

        {report.criticalGaps > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="AlertCircle" className="text-red-600 mt-0.5" size={18} />
              <div>
                <p className="font-medium text-red-900 dark:text-red-200 text-sm">
                  Критические пробелы у {report.criticalGaps} сотрудников
                </p>
                <p className="text-xs text-red-800 dark:text-red-300 mt-1">
                  Требуется срочная аттестация. Уровень соответствия менее 50%.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Общий уровень соответствия</span>
            <span className="text-sm font-bold">{report.complianceRate}%</span>
          </div>
          <Progress value={report.complianceRate} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
}
