import { useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
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
import type { IncidentStatus } from '@/types';
import RiskMatrix from './RiskMatrix';
import { exportToPDF } from '@/lib/utils/pdfExport';

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
  completed_late: 'С опозданием',
};

export default function AnalyticsTab() {
  const user = useAuthStore((state) => state.user);
  const { getIncidentsByTenant, directions, categories } = useIncidentsStore();
  const { organizations } = useSettingsStore();
  const { toast } = useToast();

  const incidents = user?.tenantId ? getIncidentsByTenant(user.tenantId) : [];

  const handleExportPDF = async () => {
    try {
      await exportToPDF({
        title: 'Аналитика инцидентов',
        subtitle: 'Сводный отчет по инцидентам и мероприятиям в области ОТ, ПБ и ЭБ',
        stats: [
          { label: 'Всего инцидентов', value: stats.total },
          { label: 'За последние 30 дней', value: stats.last30Days },
          { label: 'Процент исполнения', value: `${stats.completionRate}%` },
          { label: 'Исполнено в срок', value: `${stats.onTimeRate}%` },
          { label: 'Требует внимания', value: stats.urgentIncidents },
          { label: 'Просрочено', value: `${stats.overdue} (${stats.overdueRate}%)` },
          { label: 'В работе', value: stats.inProgress },
          { label: 'Ожидает исполнения', value: stats.awaiting },
          { label: 'Средний срок выполнения', value: `${stats.avgDaysToComplete} дн.` },
          { label: 'Создано новых', value: stats.created },
        ],
        tables: [
          {
            title: 'ТОП-10 направлений по количеству инцидентов',
            headers: ['№', 'Направление', 'Количество инцидентов'],
            data: topDirections.map((dir, index) => [
              String(index + 1),
              dir.name,
              String(dir.count),
            ]),
          },
          {
            title: 'ТОП-10 категорий инцидентов',
            headers: ['№', 'Категория', 'Количество инцидентов'],
            data: topCategories.map((cat, index) => [
              String(index + 1),
              cat.name,
              String(cat.count),
            ]),
          },
          {
            title: 'ТОП-10 организаций по количеству инцидентов',
            headers: ['№', 'Организация', 'Количество инцидентов'],
            data: organizationData.map((org, index) => [
              String(index + 1),
              org.name,
              String(org.count),
            ]),
          },
          {
            title: 'Распределение по статусам',
            headers: ['Статус', 'Количество', 'Процент от общего'],
            data: statusData.map((status) => [
              status.name,
              String(status.value),
              `${Math.round((status.value / stats.total) * 100)}%`,
            ]),
          },
        ],
        footer: 'Документ создан автоматически системой учета инцидентов',
      });

      toast({
        title: 'Экспорт завершен',
        description: 'PDF-отчет успешно сформирован и загружен',
      });
    } catch (error) {
      console.error('Ошибка экспорта в PDF:', error);
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось создать PDF-отчет',
        variant: 'destructive',
      });
    }
  };

  const stats = useMemo(() => {
    const total = incidents.length;
    const completed = incidents.filter(inc => inc.status === 'completed' || inc.status === 'completed_late').length;
    const overdue = incidents.filter(inc => inc.status === 'overdue').length;
    const inProgress = incidents.filter(inc => inc.status === 'in_progress').length;
    const awaiting = incidents.filter(inc => inc.status === 'awaiting').length;
    const created = incidents.filter(inc => inc.status === 'created').length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const overdueRate = total > 0 ? Math.round((overdue / total) * 100) : 0;
    const onTimeCompleted = incidents.filter(inc => inc.status === 'completed').length;
    const lateCompleted = incidents.filter(inc => inc.status === 'completed_late').length;
    const onTimeRate = completed > 0 ? Math.round((onTimeCompleted / completed) * 100) : 0;

    const last30Days = incidents.filter(inc => {
      const incDate = new Date(inc.reportDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return incDate >= thirtyDaysAgo;
    }).length;

    const urgentIncidents = incidents.filter(inc => 
      (inc.status === 'overdue' || (inc.status === 'awaiting' && inc.daysLeft <= 3))
    ).length;

    const avgDaysToComplete = completed > 0 
      ? Math.round(
          incidents
            .filter(inc => inc.status === 'completed' || inc.status === 'completed_late')
            .reduce((sum, inc) => {
              const reportDate = new Date(inc.reportDate);
              const plannedDate = new Date(inc.plannedDate);
              const daysDiff = Math.ceil((plannedDate.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
              return sum + Math.max(daysDiff, 0);
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
      last30Days,
      urgentIncidents,
      onTimeCompleted,
      lateCompleted,
      onTimeRate,
      avgDaysToComplete
    };
  }, [incidents]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    incidents.forEach((inc) => {
      counts[inc.status] = (counts[inc.status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_LABELS[status as IncidentStatus],
      value: count,
      color: STATUS_COLORS[status as IncidentStatus],
    }));
  }, [incidents]);

  const timelineData = useMemo(() => {
    const onTime = incidents.filter(inc => inc.status === 'completed').length;
    const late = incidents.filter(inc => inc.status === 'completed_late').length;
    const overdue = incidents.filter(inc => inc.status === 'overdue').length;
    const inProgress = incidents.filter(inc => 
      inc.status === 'in_progress' || inc.status === 'awaiting' || inc.status === 'created'
    ).length;

    return [
      { name: 'Исполнено в срок', value: onTime, color: '#10b981' },
      { name: 'Исполнено с опозданием', value: late, color: '#6366f1' },
      { name: 'Просрочено', value: overdue, color: '#ef4444' },
      { name: 'В работе', value: inProgress, color: '#3b82f6' },
    ].filter(item => item.value > 0);
  }, [incidents]);

  const topDirections = useMemo(() => {
    const counts: Record<string, number> = {};
    
    incidents.forEach((inc) => {
      const dirName = directions.find(d => d.id === inc.directionId)?.name || 'Без направления';
      counts[dirName] = (counts[dirName] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [incidents, directions]);

  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    
    incidents.forEach((inc) => {
      const catName = categories.find(c => c.id === inc.categoryId)?.name || 'Без категории';
      counts[catName] = (counts[catName] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [incidents, categories]);

  const organizationData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    incidents.forEach((inc) => {
      const orgName = organizations.find(o => o.id === inc.organizationId)?.name || 'Без организации';
      counts[orgName] = (counts[orgName] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [incidents, organizations]);

  const monthlyDynamicsData = useMemo(() => {
    const monthlyStats: Record<string, {
      total: number;
      created: number;
      completed: number;
      overdue: number;
    }> = {};

    incidents.forEach((inc) => {
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
    
    return months.slice(-12).map(monthKey => {
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
  }, [incidents]);

  if (incidents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center text-muted-foreground">
            <Icon name="BarChart3" size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Нет данных для отображения</p>
            <p className="text-sm mt-2">Добавьте инциденты, чтобы увидеть аналитику</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleExportPDF}>
          <Icon name="FileDown" size={16} />
          Экспорт в PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего инцидентов</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  +{stats.last30Days} за 30 дней
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
                  {stats.completed} из {stats.total}
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
                  {stats.onTimeCompleted} вовремя
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
                <p className="text-sm text-muted-foreground">Требует внимания</p>
                <p className="text-3xl font-bold mt-1 text-orange-600">{stats.urgentIncidents}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Срочные инциденты
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
                <p className="text-sm text-muted-foreground">Просрочено</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.overdueRate}% от общего
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
                  Активные задачи
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
                  Запланировано
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Средний срок</p>
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
      </div>

      <RiskMatrix incidents={incidents} categories={categories} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Распределение по статусам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Выполнение по срокам</CardTitle>
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
                Нет данных
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Динамика инцидентов по месяцам (последние 12 мес.)</CardTitle>
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
              Нет данных
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ТОП-10 направлений по количеству инцидентов</CardTitle>
        </CardHeader>
        <CardContent>
          {topDirections.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topDirections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Нет данных
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ТОП-10 категорий инцидентов</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topCategories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" name="Количество" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Нет данных
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ТОП-10 организаций</CardTitle>
          </CardHeader>
          <CardContent>
            {organizationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={organizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" name="Количество" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Нет данных
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}