import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Report {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'attestation' | 'compliance' | 'training' | 'analytics';
}

const reports: Report[] = [
  {
    id: '1',
    title: 'Реестр аттестаций',
    description: 'Полный список всех аттестаций сотрудников с датами и статусами',
    icon: 'FileText',
    category: 'attestation'
  },
  {
    id: '2',
    title: 'Истекающие допуски',
    description: 'Сотрудники, у которых истекают допуски в ближайшие 30-90 дней',
    icon: 'AlertTriangle',
    category: 'attestation'
  },
  {
    id: '3',
    title: 'Просроченные аттестации',
    description: 'Список сотрудников с просроченными допусками и аттестациями',
    icon: 'XCircle',
    category: 'attestation'
  },
  {
    id: '4',
    title: 'Соответствие требованиям',
    description: 'Анализ соответствия компетенций сотрудников требованиям должностей',
    icon: 'Target',
    category: 'compliance'
  },
  {
    id: '5',
    title: 'Пробелы в компетенциях',
    description: 'Выявление недостающих аттестаций по подразделениям',
    icon: 'AlertCircle',
    category: 'compliance'
  },
  {
    id: '6',
    title: 'План обучения',
    description: 'Запланированные обучения на выбранный период',
    icon: 'Calendar',
    category: 'training'
  },
  {
    id: '7',
    title: 'Стоимость обучения',
    description: 'Затраты на обучение и аттестацию персонала по периодам',
    icon: 'Wallet',
    category: 'training'
  },
  {
    id: '8',
    title: 'Эффективность обучения',
    description: 'Результаты аттестаций после прохождения обучения',
    icon: 'TrendingUp',
    category: 'training'
  },
  {
    id: '9',
    title: 'Динамика аттестаций',
    description: 'Статистика проведения аттестаций по месяцам и годам',
    icon: 'BarChart3',
    category: 'analytics'
  },
  {
    id: '10',
    title: 'Аналитика по подразделениям',
    description: 'Сравнительный анализ уровня аттестации по подразделениям',
    icon: 'PieChart',
    category: 'analytics'
  },
];

export default function ReportsTab() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [periodStart, setPeriodStart] = useState<string>('2025-01-01');
  const [periodEnd, setPeriodEnd] = useState<string>('2025-12-31');

  const filteredReports = reports.filter(report => 
    categoryFilter === 'all' || report.category === categoryFilter
  );

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'attestation': return 'Аттестации';
      case 'compliance': return 'Соответствие';
      case 'training': return 'Обучение';
      case 'analytics': return 'Аналитика';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'attestation': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'compliance': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
      case 'training': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'analytics': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const handleGenerateReport = (reportId: string) => {
    console.log('Generating report:', reportId, { periodStart, periodEnd });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Параметры отчетов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Категория отчета</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="attestation">Аттестации</SelectItem>
                  <SelectItem value="compliance">Соответствие</SelectItem>
                  <SelectItem value="training">Обучение</SelectItem>
                  <SelectItem value="analytics">Аналитика</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Период с</label>
              <Input 
                type="date" 
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Период по</label>
              <Input 
                type="date" 
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${getCategoryColor(report.category)}`}>
                  <Icon name={report.icon as any} size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{report.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(report.category)}`}>
                      {getCategoryLabel(report.category)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleGenerateReport(report.id)}
                    >
                      <Icon name="Play" size={14} />
                      Сформировать
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                    >
                      <Icon name="Download" size={14} />
                      Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                    >
                      <Icon name="FileText" size={14} />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="FileSearch" size={48} className="mx-auto mb-4 opacity-50" />
          <p>Отчеты не найдены</p>
        </div>
      )}

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Экспорт отчетов
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Все отчеты можно экспортировать в Excel для дальнейшей обработки или в PDF для печати и архивирования.
                Данные экспортируются с учетом выбранного периода и фильтров.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}