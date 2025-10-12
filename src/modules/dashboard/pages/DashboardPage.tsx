import { useMemo, memo, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCatalogStore } from '@/stores/catalogStore';
import { useTaskStore } from '@/stores/taskStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { analyzePersonnelCompetencies } from '@/lib/competencyAnalysis';
import PageHeader from '@/components/layout/PageHeader';
import { ROUTES } from '@/lib/constants';
import { toast } from 'sonner';
import {
  generateDashboardReport,
  generateTasksReport,
  generateIncidentsReport,
  generateExpertiseReport,
  generateOrganizationsReport,
  type ReportPeriod
} from '@/utils/reportGenerator';
import ReportPeriodSelector from '@/components/dashboard/ReportPeriodSelector';
import NotificationsWidget from '@/components/dashboard/NotificationsWidget';
import DashboardStats from '../components/DashboardStats';
import CompetencyReportCard from '../components/CompetencyReportCard';
import RecentActivityCard from '../components/RecentActivityCard';
import CriticalTasksCard from '../components/CriticalTasksCard';
import UpcomingExpertiseCard from '../components/UpcomingExpertiseCard';
import OrganizationsCard from '../components/OrganizationsCard';
import TasksChartCard from '../components/TasksChartCard';
import IncidentsChartCard from '../components/IncidentsChartCard';
import DeadlineCalendar from '@/components/widgets/DeadlineCalendar';

const DashboardPage = memo(function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  if (user?.role === 'SuperAdmin') {
    return <Navigate to={ROUTES.TENANTS} replace />;
  }
  
  const { objects, organizations } = useCatalogStore();
  const { tasks, getTaskStats, getOverdueTasks } = useTaskStore();
  const { incidents } = useIncidentsStore();
  const { 
    personnel, 
    competencies, 
    getOrganizationsByTenant, 
    getPersonnelByTenant,
    people,
    positions
  } = useSettingsStore();

  const taskStats = getTaskStats();
  const overdueTasks = getOverdueTasks();
  const openIncidents = incidents.filter(inc => inc.status === 'created');
  const inProgressIncidents = incidents.filter(inc => inc.status === 'in_progress');

  const tenantPersonnel = user?.tenantId ? getPersonnelByTenant(user.tenantId) : [];
  const tenantOrganizations = user?.tenantId ? getOrganizationsByTenant(user.tenantId) : [];
  
  const competencyReport = useMemo(() => {
    if (!user?.availableModules.includes('settings')) return null;
    return analyzePersonnelCompetencies(tenantPersonnel, competencies, tenantOrganizations, people, positions);
  }, [tenantPersonnel, competencies, tenantOrganizations, people, positions, user]);

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
        title: incident.description.length > 60 ? incident.description.slice(0, 60) + '...' : incident.description,
        subtitle: 'Предписание',
        time: new Date(incident.updatedAt).toLocaleDateString('ru-RU'),
        status: incident.status,
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

      const created = dayIncidents.filter(i => i.status === 'created').length;
      const inProgress = dayIncidents.filter(i => i.status === 'in_progress').length;
      const overdue = dayIncidents.filter(i => i.status === 'overdue').length;
      const completed = dayIncidents.filter(i => i.status === 'completed' || i.status === 'completed_late').length;

      return {
        date: date.getDate() + ' ' + date.toLocaleDateString('ru-RU', { month: 'short' }),
        'Создано': created,
        'В работе': inProgress,
        'Просрочено': overdue,
        'Исполнено': completed
      };
    });
  }, [incidents]);

  const handleGenerateDashboardReport = useCallback(async (period: ReportPeriod) => {
    try {
      toast.info('Формируем отчет...');
      await generateDashboardReport({
        stats: {
          totalObjects: objectsStats.total,
          activeObjects: objectsStats.active,
          openTasks: taskStats.open,
          tasksInProgress: taskStats.inProgress,
          overdueTasks: overdueTasks.length,
          openIncidents: openIncidents.length,
          criticalIncidents: incidents.filter(i => i.status === 'overdue').length,
          expertiseOverdue: objectsStats.needsExpertise
        },
        tasks: criticalTasks,
        incidents,
        objects,
        organizations
      }, period);
      toast.success('Отчет успешно сформирован!');
    } catch (error) {
      toast.error('Ошибка при формировании отчета');
    }
  }, [objectsStats, taskStats, overdueTasks, openIncidents, incidents, criticalTasks, objects, organizations]);

  const handleGenerateTasksReport = useCallback(async (period: ReportPeriod) => {
    try {
      toast.info('Формируем отчет по задачам...');
      await generateTasksReport(tasks, period);
      toast.success('Отчет по задачам сформирован!');
    } catch (error) {
      toast.error('Ошибка при формировании отчета');
    }
  }, [tasks]);

  const handleGenerateIncidentsReport = useCallback(async (period: ReportPeriod) => {
    try {
      toast.info('Формируем отчет по инцидентам...');
      await generateIncidentsReport(incidents, period);
      toast.success('Отчет по инцидентам сформирован!');
    } catch (error) {
      toast.error('Ошибка при формировании отчета');
    }
  }, [incidents]);

  const handleGenerateExpertiseReport = useCallback(async (period: ReportPeriod) => {
    try {
      toast.info('Формируем отчет по экспертизам...');
      await generateExpertiseReport(objects, organizations, period);
      toast.success('Отчет по экспертизам сформирован!');
    } catch (error) {
      toast.error('Ошибка при формировании отчета');
    }
  }, [objects, organizations]);

  const handleGenerateOrganizationsReport = useCallback(async (period: ReportPeriod) => {
    try {
      toast.info('Формируем отчет по организациям...');
      await generateOrganizationsReport(organizations, objects, period);
      toast.success('Отчет по организациям сформирован!');
    } catch (error) {
      toast.error('Ошибка при формировании отчета');
    }
  }, [organizations, objects]);

  return (
    <div>
      <PageHeader
        title={`Добро пожаловать, ${user?.name.split(' ')[0] || 'Пользователь'}`}
        description="Обзор ключевых показателей системы"
        icon="LayoutDashboard"
        action={
          <ReportPeriodSelector 
            onGenerateReport={handleGenerateDashboardReport}
            variant="default"
            size="default"
            showLabel={true}
          />
        }
      />

      <div className="mb-6">
        <NotificationsWidget />
      </div>

      <DashboardStats stats={stats} />

      {competencyReport && competencyReport.totalPersonnel > 0 && (
        <CompetencyReportCard 
          report={competencyReport}
          onNavigate={() => navigate(ROUTES.SETTINGS)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RecentActivityCard 
          activities={recentActivity}
          onGenerateReport={handleGenerateTasksReport}
          onViewAll={() => navigate(ROUTES.TASKS)}
        />

        <CriticalTasksCard 
          tasks={criticalTasks}
          onGenerateReport={handleGenerateTasksReport}
          onViewAll={() => navigate(ROUTES.TASKS)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <UpcomingExpertiseCard 
          items={upcomingExpertise}
          onGenerateReport={handleGenerateExpertiseReport}
          onViewAll={() => navigate(ROUTES.CATALOG)}
        />

        <OrganizationsCard 
          organizations={organizations}
          objects={objects}
          onGenerateReport={handleGenerateOrganizationsReport}
          onNavigate={() => navigate(ROUTES.CATALOG)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TasksChartCard 
          data={tasksChartData}
          onGenerateReport={handleGenerateTasksReport}
        />

        <IncidentsChartCard 
          data={incidentsChartData}
          onGenerateReport={handleGenerateIncidentsReport}
        />
      </div>

      <div className="mb-6">
        <DeadlineCalendar 
          tasks={tasks}
          expertises={objects.map(obj => ({
            id: obj.id,
            objectName: obj.name,
            nextExpertiseDate: obj.nextExpertiseDate || ''
          }))}
          onEventClick={(event) => {
            if (event.type === 'task') {
              navigate(ROUTES.TASKS);
            } else {
              navigate(ROUTES.CATALOG);
            }
          }}
        />
      </div>
    </div>
  );
});

export default DashboardPage;