import { useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { IncidentStatus } from '@/types';
import RiskMatrix from '../RiskMatrix';
import AnalyticsStatsGrid from '../AnalyticsStatsGrid';
import StatusDistributionCharts from '../StatusDistributionCharts';
import MonthlyDynamicsChart from '../MonthlyDynamicsChart';
import TopDirectionsChart from '../TopDirectionsChart';
import TopCategoriesOrganizationsCharts from '../TopCategoriesOrganizationsCharts';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/analyticsUtils';

export default function AnalyticsTab() {
  const user = useAuthStore((state) => state.user);
  const allIncidents = useIncidentsStore((state) => state.incidents);
  const directions = useIncidentsStore((state) => state.directions);
  const categories = useIncidentsStore((state) => state.categories);
  const { organizations } = useSettingsStore();

  const incidents = useMemo(() => 
    user?.tenantId ? allIncidents.filter(inc => inc.tenantId === user.tenantId) : []
  , [allIncidents, user?.tenantId]);

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
      <AnalyticsStatsGrid stats={stats} />

      <RiskMatrix incidents={incidents} categories={categories} />

      <StatusDistributionCharts 
        statusData={statusData}
        timelineData={timelineData}
      />

      <MonthlyDynamicsChart data={monthlyDynamicsData} />

      <TopDirectionsChart data={topDirections} />

      <TopCategoriesOrganizationsCharts
        categoriesData={topCategories}
        organizationsData={organizationData}
      />
    </div>
  );
}