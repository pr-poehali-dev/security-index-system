import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface ReportItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'objects' | 'safety' | 'compliance' | 'analytics';
  frequency?: string;
}

const reports: ReportItem[] = [
  {
    id: 'objects-registry',
    title: 'Реестр объектов',
    description: 'Полный список опасных производственных объектов с основными характеристиками',
    icon: 'Building',
    category: 'objects',
  },
  {
    id: 'expertise-schedule',
    title: 'График экспертиз',
    description: 'Плановые и предстоящие даты проведения экспертиз промышленной безопасности',
    icon: 'Calendar',
    category: 'safety',
    frequency: 'Ежемесячно',
  },
  {
    id: 'diagnostics-schedule',
    title: 'График технических диагностик',
    description: 'Расписание плановых технических диагностик оборудования',
    icon: 'ClipboardCheck',
    category: 'safety',
    frequency: 'Ежемесячно',
  },
  {
    id: 'documents-expiry',
    title: 'Сроки действия документов',
    description: 'Документы с истекающим сроком действия по всем объектам',
    icon: 'FileWarning',
    category: 'compliance',
    frequency: 'Еженедельно',
  },
  {
    id: 'hazard-analysis',
    title: 'Анализ по классам опасности',
    description: 'Распределение объектов по классам опасности и категориям',
    icon: 'AlertTriangle',
    category: 'analytics',
  },
  {
    id: 'contractors-activity',
    title: 'Активность подрядчиков',
    description: 'Статистика работы подрядных организаций на объектах',
    icon: 'Users',
    category: 'analytics',
  },
  {
    id: 'objects-by-org',
    title: 'Объекты по организациям',
    description: 'Сводная таблица объектов в разрезе организационной структуры',
    icon: 'Building2',
    category: 'objects',
  },
  {
    id: 'compliance-summary',
    title: 'Сводка по соответствию',
    description: 'Общая информация о соблюдении требований безопасности',
    icon: 'ShieldCheck',
    category: 'compliance',
    frequency: 'Ежемесячно',
  },
];

const categoryLabels: Record<ReportItem['category'], string> = {
  objects: 'Объекты',
  safety: 'Безопасность',
  compliance: 'Соответствие',
  analytics: 'Аналитика',
};

const categoryColors: Record<ReportItem['category'], string> = {
  objects: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  safety: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  compliance: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  analytics: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

export default function ReportsTab() {
  const handleGenerateReport = (reportId: string) => {
    console.log('Генерация отчета:', reportId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Отчеты по объектам</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Формирование аналитических отчетов и выгрузок данных
          </p>
        </div>
        <Button variant="outline">
          <Icon name="Settings" size={16} />
          Настроить расписание
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon name={report.icon} size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base leading-tight">{report.title}</CardTitle>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className={categoryColors[report.category]}>
                  {categoryLabels[report.category]}
                </Badge>
                {report.frequency && (
                  <Badge variant="outline" className="text-xs">
                    <Icon name="Clock" size={12} className="mr-1" />
                    {report.frequency}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-xs leading-relaxed">
                {report.description}
              </CardDescription>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleGenerateReport(report.id)}
                >
                  <Icon name="FileDown" size={14} />
                  Сформировать
                </Button>
                <Button variant="outline" size="sm">
                  <Icon name="Eye" size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Быстрая выгрузка</CardTitle>
          <CardDescription>Экспорт данных в различных форматах</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Icon name="FileSpreadsheet" size={14} />
            Excel (.xlsx)
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="FileText" size={14} />
            PDF
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="FileJson" size={14} />
            JSON
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="Database" size={14} />
            CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
