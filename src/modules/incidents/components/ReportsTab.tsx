import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import * as XLSX from 'xlsx';
import type { IncidentStatus } from '@/types';
import ReportFilters from './ReportFilters';
import ReportStatsGrid from './ReportStatsGrid';
import ReportChartsSection from './ReportChartsSection';
import { STATUS_COLORS, STATUS_LABELS } from '../utils/analyticsUtils';

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
      <ReportFilters
        periodType={periodType}
        setPeriodType={setPeriodType}
        organizationFilter={organizationFilter}
        setOrganizationFilter={setOrganizationFilter}
        directionFilter={directionFilter}
        setDirectionFilter={setDirectionFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        organizations={organizations}
        directions={directions}
        onExport={handleExportReport}
      />

      <ReportStatsGrid stats={stats} />

      <ReportChartsSection
        statusData={statusData}
        timelineData={timelineData}
        monthlyDynamicsData={monthlyDynamicsData}
        cumulativeDynamicsData={cumulativeDynamicsData}
        directionData={directionData}
        categoryData={categoryData}
        organizationData={organizationData}
        filteredIncidents={filteredIncidents}
        categories={categories}
      />
    </div>
  );
}
