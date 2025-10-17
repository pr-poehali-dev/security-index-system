import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useFacilityCatalogStore } from '../../store/useFacilityCatalogStore';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'facilities' | 'contractors' | 'inspections' | 'statistics';
}

const reportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Реестр ОПО',
    description: 'Полный список опасных производственных объектов с характеристиками',
    icon: 'Factory',
    category: 'facilities',
  },
  {
    id: '2',
    name: 'Состояние оборудования',
    description: 'Отчет о техническом состоянии оборудования по всем объектам',
    icon: 'Settings',
    category: 'facilities',
  },
  {
    id: '3',
    name: 'График технических диагностик',
    description: 'План-график проведения ТД на предстоящий период',
    icon: 'Calendar',
    category: 'inspections',
  },
  {
    id: '4',
    name: 'График экспертиз ЭПБ',
    description: 'План-график проведения экспертизы промышленной безопасности',
    icon: 'ShieldCheck',
    category: 'inspections',
  },
  {
    id: '5',
    name: 'Реестр подрядчиков',
    description: 'Список подрядных организаций с данными об аккредитации',
    icon: 'Building2',
    category: 'contractors',
  },
  {
    id: '6',
    name: 'Выполненные работы по подрядчикам',
    description: 'Статистика выполненных работ в разрезе подрядных организаций',
    icon: 'TrendingUp',
    category: 'contractors',
  },
  {
    id: '7',
    name: 'Статистика по видам работ',
    description: 'Аналитика по видам работ за выбранный период',
    icon: 'PieChart',
    category: 'statistics',
  },
  {
    id: '8',
    name: 'Просроченные мероприятия',
    description: 'Отчет о просроченных проверках и диагностиках',
    icon: 'AlertTriangle',
    category: 'statistics',
  },
];

export default function ReportsTab() {
  const facilities = useFacilityCatalogStore((state) => state.facilities);
  const contractors = useFacilityCatalogStore((state) => state.contractors);
  const technicalDiagnostics = useFacilityCatalogStore((state) => state.technicalDiagnostics);
  const industrialSafetyExpertises = useFacilityCatalogStore((state) => state.industrialSafetyExpertises);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const analyticsData = useMemo(() => ({
    totalFacilities: facilities.length,
    totalContractors: contractors.length,
    activeProjects: contractors.reduce((sum, c) => sum + (c.activeProjects || 0), 0),
    completedWorks: contractors.reduce((sum, c) => sum + (c.completedProjects || 0), 0),
    upcomingInspections: [...technicalDiagnostics, ...industrialSafetyExpertises].filter(
      item => item.status === 'planned' || item.status === 'in-progress'
    ).length,
    overdueItems: [...technicalDiagnostics, ...industrialSafetyExpertises].filter(
      item => item.status === 'overdue'
    ).length,
  }), [facilities, contractors, technicalDiagnostics, industrialSafetyExpertises]);

  const filteredReports = reportTemplates.filter(
    report => selectedCategory === 'all' || report.category === selectedCategory
  );

  const getCategoryBadge = (category: ReportTemplate['category']) => {
    const categoryConfig = {
      facilities: { label: 'Объекты', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      contractors: { label: 'Подрядчики', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
      inspections: { label: 'Проверки', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      statistics: { label: 'Статистика', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    };
    const config = categoryConfig[category];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Аналитические карточки */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Icon name="Factory" size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <Icon name="TrendingUp" size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold mb-1">{analyticsData.totalFacilities}</p>
          <p className="text-sm text-muted-foreground">Всего объектов</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Icon name="Building2" size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <Icon name="TrendingUp" size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold mb-1">{analyticsData.totalContractors}</p>
          <p className="text-sm text-muted-foreground">Подрядчиков</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Icon name="Activity" size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <Icon name="TrendingUp" size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold mb-1">{analyticsData.activeProjects}</p>
          <p className="text-sm text-muted-foreground">Активных проектов</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Icon name="CheckCircle" size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{analyticsData.completedWorks}</p>
          <p className="text-sm text-muted-foreground">Выполнено работ</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Icon name="Calendar" size={24} className="text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{analyticsData.upcomingInspections}</p>
          <p className="text-sm text-muted-foreground">Предстоящих проверок</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
              <Icon name="AlertCircle" size={24} className="text-red-600 dark:text-red-400" />
            </div>
            {analyticsData.overdueItems > 0 && (
              <Icon name="TrendingDown" size={20} className="text-red-600" />
            )}
          </div>
          <p className="text-3xl font-bold mb-1">{analyticsData.overdueItems}</p>
          <p className="text-sm text-muted-foreground">Просроченных задач</p>
        </Card>
      </div>

      {/* Шаблоны отчетов */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Icon name="FileText" size={24} />
              Шаблоны отчетов
            </h2>
            <p className="text-muted-foreground mt-1">
              Выберите шаблон для формирования отчета
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">За неделю</SelectItem>
                <SelectItem value="month">За месяц</SelectItem>
                <SelectItem value="quarter">За квартал</SelectItem>
                <SelectItem value="year">За год</SelectItem>
                <SelectItem value="custom">Произвольный период</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                <SelectItem value="facilities">Объекты</SelectItem>
                <SelectItem value="contractors">Подрядчики</SelectItem>
                <SelectItem value="inspections">Проверки</SelectItem>
                <SelectItem value="statistics">Статистика</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-blue-900/30 dark:group-hover:to-blue-800/30 transition-colors">
                  <Icon name={report.icon as any} size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{report.name}</h3>
                    {getCategoryBadge(report.category)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {report.description}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Icon name="Eye" size={14} />
                      Просмотр
                    </Button>
                    <Button size="sm" className="gap-2">
                      <Icon name="Download" size={14} />
                      Экспорт
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Быстрые действия */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
              <Icon name="FileSpreadsheet" size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Экспорт в Excel</h3>
              <p className="text-sm text-muted-foreground">Выгрузить данные в формате XLSX</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
              <Icon name="FileText" size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Экспорт в PDF</h3>
              <p className="text-sm text-muted-foreground">Создать PDF-документ</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <Icon name="Mail" size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Отправить по почте</h3>
              <p className="text-sm text-muted-foreground">Отправить отчет на email</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}