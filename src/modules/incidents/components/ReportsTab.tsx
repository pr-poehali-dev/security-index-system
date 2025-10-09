import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import * as XLSX from 'xlsx';
import type { IncidentStatus } from '@/types';
import RiskMatrix from './RiskMatrix';

const STATUS_COLORS: Record<IncidentStatus, string> = {
  created: '#94a3b8',
  in_progress: '#3b82f6',
  awaiting: '#f59e0b',
  overdue: '#ef4444',
  completed: '#10b981',
  completed_late: '#6366f1',
};

const STATUS_LABELS: Record<IncidentStatus, string> = {
  created: 'Создано',
  in_progress: 'В работе',
  awaiting: 'Ожидает',
  overdue: 'Просрочено',
  completed: 'Исполнено',
  completed_late: 'Исполнено с опозданием',
};

export default function ReportsTab() {
  const user = useAuthStore((state) => state.user);
  const { getIncidentsByTenant, directions, categories } = useIncidentsStore();
  const { organizations } = useSettingsStore();

  const [periodType, setPeriodType] = useState<string>('month');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const incidents = user?.tenantId ? getIncidentsByTenant(user.tenantId) : [];

  const filteredIncidents = useMemo(() => {
    let filtered = incidents;

    if (organizationFilter !== 'all') {
      filtered = filtered.filter((inc) => inc.organizationId === organizationFilter);
    }

    if (directionFilter !== 'all') {
      filtered = filtered.filter((inc) => inc.directionId === directionFilter);
    }

    if (periodType === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((inc) => {
        const incDate = new Date(inc.reportDate);
        return incDate >= start && incDate <= end;
      });
    } else if (periodType !== 'all') {
      const now = new Date();
      const periodStart = new Date();

      switch (periodType) {
        case 'month':
          periodStart.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          periodStart.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          periodStart.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((inc) => new Date(inc.reportDate) >= periodStart);
    }

    return filtered;
  }, [incidents, periodType, organizationFilter, directionFilter, startDate, endDate]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    filteredIncidents.forEach((inc) => {
      counts[inc.status] = (counts[inc.status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_LABELS[status as IncidentStatus],
      value: count,
      color: STATUS_COLORS[status as IncidentStatus],
    }));
  }, [filteredIncidents]);

  const directionData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    filteredIncidents.forEach((inc) => {
      const dirName = directions.find(d => d.id === inc.directionId)?.name || 'Без направления';
      counts[dirName] = (counts[dirName] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredIncidents, directions]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    filteredIncidents.forEach((inc) => {
      const catName = categories.find(c => c.id === inc.categoryId)?.name || 'Без категории';
      counts[catName] = (counts[catName] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredIncidents, categories]);

  const organizationData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    filteredIncidents.forEach((inc) => {
      const orgName = organizations.find(o => o.id === inc.organizationId)?.name || 'Без организации';
      counts[orgName] = (counts[orgName] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredIncidents, organizations]);

  const timelineData = useMemo(() => {
    const onTime = filteredIncidents.filter(inc => inc.status === 'completed').length;
    const late = filteredIncidents.filter(inc => inc.status === 'completed_late').length;
    const overdue = filteredIncidents.filter(inc => inc.status === 'overdue').length;
    const inProgress = filteredIncidents.filter(inc => 
      inc.status === 'in_progress' || inc.status === 'awaiting' || inc.status === 'created'
    ).length;

    return [
      { name: 'Исполнено в срок', value: onTime, color: '#10b981' },
      { name: 'Исполнено с опозданием', value: late, color: '#6366f1' },
      { name: 'Просрочено', value: overdue, color: '#ef4444' },
      { name: 'В работе', value: inProgress, color: '#3b82f6' },
    ].filter(item => item.value > 0);
  }, [filteredIncidents]);

  const monthlyDynamicsData = useMemo(() => {
    const monthlyStats: Record<string, {
      total: number;
      created: number;
      completed: number;
      overdue: number;
    }> = {};

    filteredIncidents.forEach((inc) => {
      const date = new Date(inc.reportDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { total: 0, created: 0, completed: 0, overdue: 0 };
      }
      
      monthlyStats[monthKey].total++;
      
      if (inc.status === 'created') {
        monthlyStats[monthKey].created++;
      } else if (inc.status === 'completed' || inc.status === 'completed_late') {
        monthlyStats[monthKey].completed++;
      } else if (inc.status === 'overdue') {
        monthlyStats[monthKey].overdue++;
      }
    });

    const months = Object.keys(monthlyStats).sort();
    
    return months.map(monthKey => {
      const [year, month] = monthKey.split('-');
      const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      const monthName = `${monthNames[parseInt(month) - 1]} ${year}`;
      
      return {
        month: monthName,
        'Всего': monthlyStats[monthKey].total,
        'Создано': monthlyStats[monthKey].created,
        'Исполнено': monthlyStats[monthKey].completed,
        'Просрочено': monthlyStats[monthKey].overdue,
      };
    });
  }, [filteredIncidents]);

  const cumulativeDynamicsData = useMemo(() => {
    const monthlyStats: Record<string, {
      created: number;
      completed: number;
    }> = {};

    filteredIncidents.forEach((inc) => {
      const date = new Date(inc.reportDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { created: 0, completed: 0 };
      }
      
      monthlyStats[monthKey].created++;
      
      if (inc.status === 'completed' || inc.status === 'completed_late') {
        const completedDate = new Date(inc.plannedDate);
        const completedMonthKey = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyStats[completedMonthKey]) {
          monthlyStats[completedMonthKey] = { created: 0, completed: 0 };
        }
        monthlyStats[completedMonthKey].completed++;
      }
    });

    const months = Object.keys(monthlyStats).sort();
    let cumulativeCreated = 0;
    let cumulativeCompleted = 0;
    
    return months.map(monthKey => {
      const [year, month] = monthKey.split('-');
      const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      const monthName = `${monthNames[parseInt(month) - 1]} ${year}`;
      
      cumulativeCreated += monthlyStats[monthKey].created;
      cumulativeCompleted += monthlyStats[monthKey].completed;
      
      return {
        month: monthName,
        'Создано накопительно': cumulativeCreated,
        'Исполнено накопительно': cumulativeCompleted,
        'Открытых инцидентов': cumulativeCreated - cumulativeCompleted,
      };
    });
  }, [filteredIncidents]);

  const handleExportReport = () => {
    const reportData = filteredIncidents.map((inc, index) => {
      const org = organizations.find(o => o.id === inc.organizationId);
      const dir = directions.find(d => d.id === inc.directionId);
      const cat = categories.find(c => c.id === inc.categoryId);

      return {
        '№': index + 1,
        'Организация': org?.name || '—',
        'Дата инцидента': new Date(inc.reportDate).toLocaleDateString('ru-RU'),
        'Направление': dir?.name || '—',
        'Категория': cat?.name || '—',
        'Описание': inc.description,
        'Статус': STATUS_LABELS[inc.status],
        'Плановая дата': new Date(inc.plannedDate).toLocaleDateString('ru-RU'),
        'Дней осталось': inc.daysLeft,
      };
    });

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Отчет');

    const colWidths = [
      { wch: 5 },
      { wch: 30 },
      { wch: 15 },
      { wch: 25 },
      { wch: 20 },
      { wch: 40 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
    ];
    ws['!cols'] = colWidths;

    const fileName = `Отчет_инциденты_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const stats = useMemo(() => {
    const total = filteredIncidents.length;
    const completed = filteredIncidents.filter(inc => inc.status === 'completed' || inc.status === 'completed_late').length;
    const overdue = filteredIncidents.filter(inc => inc.status === 'overdue').length;
    const inProgress = filteredIncidents.filter(inc => inc.status === 'in_progress').length;
    const awaiting = filteredIncidents.filter(inc => inc.status === 'awaiting').length;
    const created = filteredIncidents.filter(inc => inc.status === 'created').length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const overdueRate = total > 0 ? Math.round((overdue / total) * 100) : 0;
    const onTimeCompleted = filteredIncidents.filter(inc => inc.status === 'completed').length;
    const lateCompleted = filteredIncidents.filter(inc => inc.status === 'completed_late').length;
    const onTimeRate = completed > 0 ? Math.round((onTimeCompleted / completed) * 100) : 0;

    const avgDaysToComplete = completed > 0 
      ? Math.round(
          filteredIncidents
            .filter(inc => inc.status === 'completed' || inc.status === 'completed_late')
            .reduce((sum, inc) => {
              const reportDate = new Date(inc.reportDate);
              const plannedDate = new Date(inc.plannedDate);
              const daysDiff = Math.ceil((plannedDate.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
              return sum + daysDiff;
            }, 0) / completed
        )
      : 0;

    return { 
      total, 
      completed, 
      overdue, 
      inProgress, 
      awaiting,
      created,
      completionRate, 
      overdueRate,
      onTimeCompleted,
      lateCompleted,
      onTimeRate,
      avgDaysToComplete
    };
  }, [filteredIncidents]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Фильтры отчёта</CardTitle>
            <Button onClick={handleExportReport}>
              <Icon name="Download" size={16} />
              Экспорт в Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Период</Label>
              <Select value={periodType} onValueChange={setPeriodType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всё время</SelectItem>
                  <SelectItem value="month">Последний месяц</SelectItem>
                  <SelectItem value="quarter">Последний квартал</SelectItem>
                  <SelectItem value="year">Последний год</SelectItem>
                  <SelectItem value="custom">Произвольный период</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodType === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>Начало периода</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Конец периода</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Организация</Label>
              <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все организации</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Направление</Label>
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все направления</SelectItem>
                  {directions.filter(d => d.status === 'active').map((dir) => (
                    <SelectItem key={dir.id} value={dir.id}>{dir.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего инцидентов</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  За выбранный период
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="FileText" size={24} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Процент исполнения</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completed} из {stats.total} инцидентов
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="TrendingUp" size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Исполнено в срок</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.onTimeRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.onTimeCompleted} вовремя, {stats.lateCompleted} с опозданием
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Средний срок выполнения</p>
                <p className="text-3xl font-bold mt-1 text-purple-600">{stats.avgDaysToComplete}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  дней на инцидент
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon name="Calendar" size={24} className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Просрочено</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.overdueRate}% от общего числа
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name="AlertCircle" size={24} className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">В работе</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Активных инцидентов
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="Activity" size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ожидает исполнения</p>
                <p className="text-3xl font-bold mt-1 text-orange-600">{stats.awaiting}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Требуют внимания
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={24} className="text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Создано</p>
                <p className="text-3xl font-bold mt-1 text-gray-600">{stats.created}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Новых инцидентов
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon name="FilePlus" size={24} className="text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Распределение по статусам</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Выполнение по срокам</CardTitle>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={timelineData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {timelineData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Динамика инцидентов по месяцам</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyDynamicsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyDynamicsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Всего" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="Создано" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="Исполнено" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="Просрочено" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Нет данных для отображения
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Накопительная динамика и баланс инцидентов</CardTitle>
        </CardHeader>
        <CardContent>
          {cumulativeDynamicsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cumulativeDynamicsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Создано накопительно" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="Исполнено накопительно" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="Открытых инцидентов" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Нет данных для отображения
            </div>
          )}
        </CardContent>
      </Card>

      <RiskMatrix incidents={filteredIncidents} categories={categories} />

      <Card>
        <CardHeader>
          <CardTitle>Топ-10 направлений по количеству инцидентов</CardTitle>
        </CardHeader>
        <CardContent>
          {directionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={directionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Количество инцидентов" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Нет данных для отображения
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Топ-10 категорий по количеству инцидентов</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" name="Количество инцидентов" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Топ-10 организаций по количеству инцидентов</CardTitle>
          </CardHeader>
          <CardContent>
            {organizationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={organizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" name="Количество инцидентов" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}