import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCertificationStore } from '@/stores/certificationStore';
import { getPersonnelFullInfo, getCertificationStatus } from '@/lib/utils/personnelUtils';
import TaskStatisticsCards from './TaskStatisticsCards';
import TaskFilters from './TaskFilters';
import TaskCard from './TaskCard';
import TaskDetailsDialog from './TaskDetailsDialog';
import PriorityStatistics from './PriorityStatistics';
import { getStatusLabel } from '../utils/taskUtils';
import type { Task } from '../types/task';

export default function TasksTab() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { personnel, people, positions, departments: deptList } = useSettingsStore();
  const { certifications } = useCertificationStore();
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, { status: 'pending' | 'in_progress' | 'completed', completedAt?: string }>>({});

  const tasks = useMemo(() => {
    const result: Task[] = [];
    const tenantPersonnel = user?.tenantId 
      ? personnel.filter(p => p.tenantId === user.tenantId && p.personnelType === 'employee') 
      : [];
    
    tenantPersonnel.forEach(p => {
      const info = getPersonnelFullInfo(p, people, positions);
      const dept = deptList.find(d => d.id === p.departmentId);
      const personnelCerts = certifications.filter(c => c.personnelId === p.id);
      
      personnelCerts.forEach(cert => {
        const { status, daysLeft } = getCertificationStatus(cert.expiryDate);
        const expiryDate = new Date(cert.expiryDate);
        
        const categoryMap: Record<string, string> = {
          industrial_safety: 'Промышленная безопасность',
          energy_safety: 'Электробезопасность',
          labor_safety: 'Охрана труда',
          ecology: 'Экология'
        };
        
        if (daysLeft < 0) {
          result.push({
            id: `task-${p.id}-${cert.id}-expired`,
            type: 'expired',
            priority: 'critical',
            employeeName: info.fullName,
            employeeId: p.id,
            employeePosition: info.position,
            department: dept?.name || '—',
            category: categoryMap[cert.category] || cert.category,
            area: cert.area,
            expiryDate: cert.expiryDate,
            daysLeft,
            createdAt: new Date(expiryDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
          });
        } else if (daysLeft <= 30) {
          result.push({
            id: `task-${p.id}-${cert.id}-30`,
            type: 'reminder_30',
            priority: 'high',
            employeeName: info.fullName,
            employeeId: p.id,
            employeePosition: info.position,
            department: dept?.name || '—',
            category: categoryMap[cert.category] || cert.category,
            area: cert.area,
            expiryDate: cert.expiryDate,
            daysLeft,
            createdAt: new Date(expiryDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
          });
        } else if (daysLeft <= 60) {
          result.push({
            id: `task-${p.id}-${cert.id}-60`,
            type: 'reminder_60',
            priority: 'medium',
            employeeName: info.fullName,
            employeeId: p.id,
            employeePosition: info.position,
            department: dept?.name || '—',
            category: categoryMap[cert.category] || cert.category,
            area: cert.area,
            expiryDate: cert.expiryDate,
            daysLeft,
            createdAt: new Date(expiryDate.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
          });
        } else if (daysLeft <= 90) {
          result.push({
            id: `task-${p.id}-${cert.id}-90`,
            type: 'reminder_90',
            priority: 'low',
            employeeName: info.fullName,
            employeeId: p.id,
            employeePosition: info.position,
            department: dept?.name || '—',
            category: categoryMap[cert.category] || cert.category,
            area: cert.area,
            expiryDate: cert.expiryDate,
            daysLeft,
            createdAt: new Date(expiryDate.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
          });
        }
      });
    });
    
    return result.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [user?.tenantId, personnel, people, positions, deptList, certifications]);

  const tasksWithStatuses = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      status: taskStatuses[task.id]?.status || task.status,
      completedAt: taskStatuses[task.id]?.completedAt
    }));
  }, [tasks, taskStatuses]);

  const departments = useMemo(() => {
    return Array.from(new Set(tasksWithStatuses.map(t => t.department))).filter(d => d !== '—');
  }, [tasksWithStatuses]);

  const filteredTasks = useMemo(() => {
    return tasksWithStatuses.filter(task => {
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesDepartment = filterDepartment === 'all' || task.department === filterDepartment;
      return matchesStatus && matchesPriority && matchesDepartment;
    });
  }, [tasksWithStatuses, filterStatus, filterPriority, filterDepartment]);

  const statistics = useMemo(() => {
    return {
      total: tasksWithStatuses.length,
      pending: tasksWithStatuses.filter(t => t.status === 'pending').length,
      inProgress: tasksWithStatuses.filter(t => t.status === 'in_progress').length,
      completed: tasksWithStatuses.filter(t => t.status === 'completed').length,
      critical: tasksWithStatuses.filter(t => t.priority === 'critical').length,
      high: tasksWithStatuses.filter(t => t.priority === 'high').length,
      medium: tasksWithStatuses.filter(t => t.priority === 'medium').length,
      low: tasksWithStatuses.filter(t => t.priority === 'low').length,
    };
  }, [tasksWithStatuses]);

  const handleTaskStatusChange = (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    setTaskStatuses(prev => ({
      ...prev,
      [taskId]: {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
      }
    }));

    toast({
      title: "Статус обновлён",
      description: `Задача переведена в статус "${getStatusLabel(newStatus)}"`,
    });
  };

  const handleBulkStatusChange = (newStatus: 'in_progress' | 'completed') => {
    if (selectedTasks.size === 0) return;

    const updates: Record<string, { status: 'pending' | 'in_progress' | 'completed', completedAt?: string }> = {};
    selectedTasks.forEach(taskId => {
      updates[taskId] = {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
      };
    });

    setTaskStatuses(prev => ({ ...prev, ...updates }));

    toast({
      title: "Массовое обновление",
      description: `Обновлено задач: ${selectedTasks.size}`,
    });

    setSelectedTasks(new Set());
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(filteredTasks.map(t => t.id)));
    } else {
      setSelectedTasks(new Set());
    }
  };

  return (
    <div className="space-y-6">
      <TaskStatisticsCards statistics={statistics} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Автоматические задачи</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Задачи создаются автоматически за 90/60/30 дней до истечения аттестаций
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TaskFilters
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterPriority={filterPriority}
              setFilterPriority={setFilterPriority}
              filterDepartment={filterDepartment}
              setFilterDepartment={setFilterDepartment}
              departments={departments}
              selectedTasksCount={selectedTasks.size}
              onBulkInProgress={() => handleBulkStatusChange('in_progress')}
              onBulkCompleted={() => handleBulkStatusChange('completed')}
            />

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Checkbox
                  checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">Выбрать все</span>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="CheckCircle2" size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Нет задач по выбранным фильтрам</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isSelected={selectedTasks.has(task.id)}
                    onSelect={(checked) => handleSelectTask(task.id, checked)}
                    onStatusChange={(newStatus) => handleTaskStatusChange(task.id, newStatus)}
                    onViewDetails={() => setSelectedTask(task)}
                  />
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <PriorityStatistics statistics={statistics} />

      <TaskDetailsDialog
        task={selectedTask}
        open={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}