import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCatalogStore } from '@/stores/catalogStore';
import { useTaskStore } from '@/stores/taskStore';
import { useIncidentStore } from '@/stores/incidentStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import Icon from '@/components/ui/icon';
import { ROUTES } from '@/lib/constants';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    case 'open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed': return 'Завершено';
    case 'in_progress': return 'В работе';
    case 'pending': return 'Ожидает';
    case 'open': return 'Открыто';
    case 'resolved': return 'Решено';
    case 'closed': return 'Закрыто';
    default: return status;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
    case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'critical': return 'Критический';
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
    default: return priority;
  }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { objects, organizations } = useCatalogStore();
  const { tasks, getTaskStats, getOverdueTasks } = useTaskStore();
  const { incidents, getIncidentsByStatus } = useIncidentStore();

  const taskStats = getTaskStats();
  const overdueTasks = getOverdueTasks();
  const openIncidents = getIncidentsByStatus('open');
  const inProgressIncidents = getIncidentsByStatus('in_progress');

  const objectsStats = useMemo(() => {
    const total = objects.length;
    const active = objects.filter(o => o.status === 'active').length;
    const needsExpertise = objects.filter(o => 
      o.nextExpertiseDate && new Date(o.nextExpertiseDate) < new Date()
    ).length;
    const soonExpertise = objects.filter(o => {
      if (!o.nextExpertiseDate) return false;
      const diffDays = Math.floor((new Date(o.nextExpertiseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 90 && diffDays >= 0;
    }).length;
    
    return { total, active, needsExpertise, soonExpertise };
  }, [objects]);

  const stats = [
    {
      title: 'Всего объектов',
      value: objectsStats.total.toString(),
      subtitle: `${objectsStats.active} активных`,
      trend: objectsStats.active > objectsStats.total / 2 ? 'up' : 'down',
      icon: 'Building',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      onClick: () => navigate(ROUTES.CATALOG)
    },
    {
      title: 'Задачи',
      value: taskStats.open.toString(),
      subtitle: `${taskStats.inProgress} в работе`,
      trend: taskStats.open > 0 ? 'neutral' : 'up',
      icon: 'ListTodo',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      badge: overdueTasks.length > 0 ? { text: `${overdueTasks.length} просрочено`, variant: 'destructive' as const } : undefined,
      onClick: () => navigate(ROUTES.TASKS)
    },
    {
      title: 'Инциденты',
      value: (openIncidents.length + inProgressIncidents.length).toString(),
      subtitle: `${openIncidents.length} открыто`,
      trend: openIncidents.length === 0 ? 'up' : 'down',
      icon: 'AlertCircle',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      onClick: () => navigate(ROUTES.INCIDENTS)
    },
    {
      title: 'Требуют внимания',
      value: (objectsStats.needsExpertise + objectsStats.soonExpertise).toString(),
      subtitle: `${objectsStats.needsExpertise} просрочено`,
      trend: objectsStats.needsExpertise === 0 ? 'up' : 'down',
      icon: 'AlertTriangle',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      onClick: () => navigate(ROUTES.CATALOG)
    }
  ];

  const recentActivity = useMemo(() => {
    const activities: Array<{
      id: string;
      type: 'task' | 'incident' | 'object';
      title: string;
      subtitle: string;
      time: string;
      status: string;
      priority?: string;
      onClick: () => void;
    }> = [];

    tasks.slice(0, 3).forEach(task => {
      activities.push({
        id: task.id,
        type: 'task',
        title: task.title,
        subtitle: task.assignee || 'Не назначено',
        time: new Date(task.updatedAt).toLocaleDateString('ru-RU'),
        status: task.status,
        priority: task.priority,
        onClick: () => navigate(ROUTES.TASKS)
      });
    });

    incidents.slice(0, 2).forEach(incident => {
      activities.push({
        id: incident.id,
        type: 'incident',
        title: incident.title,
        subtitle: incident.assignedToName || 'Не назначено',
        time: new Date(incident.updatedAt).toLocaleDateString('ru-RU'),
        status: incident.status,
        priority: incident.priority,
        onClick: () => navigate(ROUTES.INCIDENTS)
      });
    });

    return activities.sort((a, b) => 
      new Date(b.time).getTime() - new Date(a.time).getTime()
    ).slice(0, 5);
  }, [tasks, incidents, navigate]);

  const upcomingExpertise = useMemo(() => {
    return objects
      .filter(obj => obj.nextExpertiseDate)
      .map(obj => {
        const dueDate = new Date(obj.nextExpertiseDate!);
        const daysLeft = Math.floor((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const organization = organizations.find(org => org.id === obj.organizationId);
        
        return {
          id: obj.id,
          name: obj.name,
          organization: organization?.name || 'Не указана',
          date: obj.nextExpertiseDate!,
          daysLeft,
          type: obj.type
        };
      })
      .filter(item => item.daysLeft >= -30 && item.daysLeft <= 90)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [objects, organizations]);

  const criticalTasks = useMemo(() => {
    return tasks
      .filter(task => 
        task.priority === 'critical' || 
        task.priority === 'high' ||
        (task.dueDate && new Date(task.dueDate) < new Date())
      )
      .sort((a, b) => {
        if (a.priority === 'critical' && b.priority !== 'critical') return -1;
        if (a.priority !== 'critical' && b.priority === 'critical') return 1;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 5);
  }, [tasks]);

  const tasksChartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date;
    });

    return last30Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
        return taskDate === dateStr;
      });

      const completed = dayTasks.filter(t => t.status === 'completed').length;
      const open = dayTasks.filter(t => t.status === 'open').length;
      const inProgress = dayTasks.filter(t => t.status === 'in_progress').length;

      return {
        date: date.getDate() + ' ' + date.toLocaleDateString('ru-RU', { month: 'short' }),
        'Открыто': open,
        'В работе': inProgress,
        'Завершено': completed
      };
    });
  }, [tasks]);

  const incidentsChartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date;
    });

    return last30Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayIncidents = incidents.filter(incident => {
        const incidentDate = new Date(incident.createdAt).toISOString().split('T')[0];
        return incidentDate === dateStr;
      });

      const critical = dayIncidents.filter(i => i.priority === 'critical').length;
      const high = dayIncidents.filter(i => i.priority === 'high').length;
      const medium = dayIncidents.filter(i => i.priority === 'medium').length;
      const low = dayIncidents.filter(i => i.priority === 'low').length;

      return {
        date: date.getDate() + ' ' + date.toLocaleDateString('ru-RU', { month: 'short' }),
        'Критический': critical,
        'Высокий': high,
        'Средний': medium,
        'Низкий': low
      };
    });
  }, [incidents]);

  return (
    <div>
      <PageHeader
        title={`Добро пожаловать, ${user?.name.split(' ')[0] || 'Пользователь'}`}
        description="Обзор ключевых показателей системы"
        icon="LayoutDashboard"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="hover-scale cursor-pointer transition-all hover:border-primary/50"
            onClick={stat.onClick}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon name={stat.icon as any} className={stat.color} size={24} />
                </div>
                {stat.badge && (
                  <Badge variant={stat.badge.variant} className="text-xs">
                    {stat.badge.text}
                  </Badge>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Activity" size={20} className="text-emerald-600" />
                Последняя активность
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.TASKS)}>
                Все задачи
                <Icon name="ArrowRight" size={14} className="ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Inbox" size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Нет активности</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={activity.onClick}
                  >
                    <div className="mt-1">
                      <Icon 
                        name={
                          activity.type === 'task' ? 'ListTodo' :
                          activity.type === 'incident' ? 'AlertCircle' : 'Building'
                        } 
                        size={18}
                        className={
                          activity.type === 'task' ? 'text-emerald-600' :
                          activity.type === 'incident' ? 'text-red-600' : 'text-blue-600'
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{activity.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{activity.subtitle} • {activity.time}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge className={getStatusColor(activity.status)} variant="secondary">
                        {getStatusLabel(activity.status)}
                      </Badge>
                      {activity.priority && (
                        <Badge className={getPriorityColor(activity.priority)} variant="outline">
                          {getPriorityLabel(activity.priority)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="AlertTriangle" size={20} className="text-red-600" />
                Критические задачи
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.TASKS)}>
                Все задачи
                <Icon name="ArrowRight" size={14} className="ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {criticalTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="CheckCircle2" size={48} className="mx-auto mb-2 opacity-50 text-emerald-600" />
                <p className="text-sm">Нет критических задач</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalTasks.map((task) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                  
                  return (
                    <div 
                      key={task.id} 
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => navigate(ROUTES.TASKS)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{task.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{task.assignee || 'Не назначено'}</p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Badge className={getPriorityColor(task.priority)} variant="outline">
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        </div>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-2 text-xs">
                          <Icon name="Calendar" size={12} className={isOverdue ? 'text-red-600' : 'text-gray-500'} />
                          <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                            {isOverdue ? 'Просрочено: ' : 'Срок: '}
                            {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Calendar" size={20} className="text-amber-600" />
                Экспертизы промышленной безопасности
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.CATALOG)}>
                Все объекты
                <Icon name="ArrowRight" size={14} className="ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingExpertise.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="CheckCircle2" size={48} className="mx-auto mb-2 opacity-50 text-emerald-600" />
                <p className="text-sm">Нет предстоящих экспертиз</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingExpertise.map((item) => {
                  const isOverdue = item.daysLeft < 0;
                  const isCritical = item.daysLeft <= 30 && item.daysLeft >= 0;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => navigate(ROUTES.CATALOG)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{item.organization}</p>
                        </div>
                        <Badge 
                          variant={isOverdue ? 'destructive' : isCritical ? 'default' : 'secondary'} 
                          className="text-xs ml-2"
                        >
                          {isOverdue 
                            ? `Просрочено ${Math.abs(item.daysLeft)} дн.`
                            : `${item.daysLeft} дн.`
                          }
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>До экспертизы</span>
                          <span>{new Date(item.date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <Progress 
                          value={isOverdue ? 100 : Math.min(((90 - item.daysLeft) / 90) * 100, 100)} 
                          className="h-1"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Building2" size={20} className="text-blue-600" />
              Организации
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organizations.filter(org => !org.parentId).slice(0, 5).map((org) => {
                const orgObjects = objects.filter(obj => obj.organizationId === org.id);
                const activeObjects = orgObjects.filter(obj => obj.status === 'active');
                
                return (
                  <div 
                    key={org.id} 
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => navigate(ROUTES.CATALOG)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{org.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {org.type === 'holding' ? 'Холдинг' : 
                             org.type === 'legal_entity' ? 'Юр. лицо' : 'Филиал'}
                          </Badge>
                          {orgObjects.length > 0 && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {activeObjects.length} / {orgObjects.length} объектов
                            </span>
                          )}
                        </div>
                      </div>
                      <Icon name="ChevronRight" size={16} className="text-gray-400 mt-1" />
                    </div>
                  </div>
                );
              })}
              {organizations.filter(org => !org.parentId).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Building2" size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Нет организаций</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-emerald-600" />
              Динамика задач за 30 дней
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tasksChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Открыто" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="В работе" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Завершено" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BarChart3" size={20} className="text-red-600" />
              Инциденты по приоритетам за 30 дней
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incidentsChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="Критический" stackId="a" fill="#ef4444" />
                <Bar dataKey="Высокий" stackId="a" fill="#f97316" />
                <Bar dataKey="Средний" stackId="a" fill="#eab308" />
                <Bar dataKey="Низкий" stackId="a" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}