import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Incident, IncidentStatus } from '@/types';

interface IncidentsDashboardProps {
  incidents: Incident[];
  directions: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}

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

export default function IncidentsDashboard({ incidents, directions, categories }: IncidentsDashboardProps) {
  const stats = useMemo(() => {
    const total = incidents.length;
    const completed = incidents.filter(inc => inc.status === 'completed' || inc.status === 'completed_late').length;
    const overdue = incidents.filter(inc => inc.status === 'overdue').length;
    const inProgress = incidents.filter(inc => inc.status === 'in_progress').length;
    const awaiting = incidents.filter(inc => inc.status === 'awaiting').length;
    const created = incidents.filter(inc => inc.status === 'created').length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const overdueRate = total > 0 ? Math.round((overdue / total) * 100) : 0;

    const last30Days = incidents.filter(inc => {
      const incDate = new Date(inc.reportDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return incDate >= thirtyDaysAgo;
    }).length;

    const urgentIncidents = incidents.filter(inc => 
      (inc.status === 'overdue' || (inc.status === 'awaiting' && inc.daysLeft <= 3))
    ).length;

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
      urgentIncidents
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

  const topDirections = useMemo(() => {
    const counts: Record<string, number> = {};
    
    incidents.forEach((inc) => {
      const dirName = directions.find(d => d.id === inc.directionId)?.name || 'Без направления';
      counts[dirName] = (counts[dirName] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
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
      .slice(0, 5);
  }, [incidents, categories]);

  if (incidents.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="p-12">
          <div className="text-center text-muted-foreground">
            <Icon name="BarChart3" size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Нет данных для отображения</p>
            <p className="text-sm mt-2">Добавьте первый инцидент, чтобы увидеть аналитику</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mb-6">
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
                <p className="text-sm text-muted-foreground">Исполнено</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.completed}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completionRate}% от общего числа
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-green-600" />
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
                <p className="text-sm text-muted-foreground">Требует внимания</p>
                <p className="text-3xl font-bold mt-1 text-orange-600">{stats.urgentIncidents}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Просрочено или срок &lt; 3 дней
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={24} className="text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Распределение по статусам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
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
            <CardTitle className="text-base">Распределение по направлениям (ТОП-5)</CardTitle>
          </CardHeader>
          <CardContent>
            {topDirections.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topDirections} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Инциденты" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Нет данных
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ТОП-5 категорий инцидентов</CardTitle>
        </CardHeader>
        <CardContent>
          {topCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topCategories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Нет данных
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
