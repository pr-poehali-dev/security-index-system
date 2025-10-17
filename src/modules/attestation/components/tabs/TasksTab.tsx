import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAttestationStore } from '@/stores/certificationStore';
import { useOrdersStore } from '@/stores/ordersStore';
import { getPersonnelFullInfo, getCertificationStatus } from '@/lib/utils/personnelUtils';
import TaskStatisticsCards from '../TaskStatisticsCards';
import TaskFilters from '../TaskFilters';
import TaskCard from '../TaskCard';
import TaskDetailsDialog from '../TaskDetailsDialog';
import PriorityStatistics from '../PriorityStatistics';
import MassActionDialog from '../orders/MassActionDialog';
import { getStatusLabel } from '../../utils/taskUtils';
import type { Task } from '../../types/task';

export default function TasksTab() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { personnel, people, positions, departments: deptList } = useSettingsStore();
  const { attestations } = useAttestationStore();
  const orders = useOrdersStore((state) => state.orders);
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterOrderStatus, setFilterOrderStatus] = useState<string>('all');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, { status: 'pending' | 'in_progress' | 'completed', completedAt?: string }>>({});
  const [showMassActionDialog, setShowMassActionDialog] = useState(false);
  const [massActionType, setMassActionType] = useState<string>('');

  const tasks = useMemo(() => {
    const result: Task[] = [];
    const tenantPersonnel = user?.tenantId 
      ? personnel.filter(p => p.tenantId === user.tenantId && p.personnelType === 'employee') 
      : [];
    
    tenantPersonnel.forEach(p => {
      const info = getPersonnelFullInfo(p, people, positions);
      const dept = deptList.find(d => d.id === p.departmentId);
      const personnelCerts = attestations.filter(c => c.personnelId === p.id);
      
      personnelCerts.forEach(cert => {
        const { status, daysLeft } = getCertificationStatus(cert.expiryDate);
        const expiryDate = new Date(cert.expiryDate);
        
        const categoryMap: Record<string, string> = {
          industrial_safety: 'Промышленная безопасность',
          energy_safety: 'Электробезопасность',
          labor_safety: 'Охрана труда',
          ecology: 'Экология'
        };

        // Проверка наличия активного приказа для этой сертификации
        const activeOrder = orders.find(order => 
          order.tenantId === user?.tenantId &&
          order.status !== 'cancelled' && 
          order.status !== 'completed' &&
          order.certifications?.some(oc => 
            oc.personnelId === p.id && 
            oc.certificationId === cert.id
          )
        );
        
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
            certificationId: cert.id,
            expiryDate: cert.expiryDate,
            daysLeft,
            createdAt: new Date(expiryDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            hasActiveOrder: !!activeOrder,
            orderNumber: activeOrder?.number
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
            certificationId: cert.id,
            expiryDate: cert.expiryDate,
            daysLeft,
            createdAt: new Date(expiryDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            hasActiveOrder: !!activeOrder,
            orderNumber: activeOrder?.number
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
            certificationId: cert.id,
            expiryDate: cert.expiryDate,
            daysLeft,
            createdAt: new Date(expiryDate.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            hasActiveOrder: !!activeOrder,
            orderNumber: activeOrder?.number
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
            certificationId: cert.id,
            expiryDate: cert.expiryDate,
            daysLeft,
            createdAt: new Date(expiryDate.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            hasActiveOrder: !!activeOrder,
            orderNumber: activeOrder?.number
          });
        }
      });
    });
    
    return result.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [user?.tenantId, personnel, people, positions, deptList, attestations, orders]);

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
      const matchesOrderStatus = filterOrderStatus === 'all' || 
        (filterOrderStatus === 'with_order' && task.hasActiveOrder) ||
        (filterOrderStatus === 'without_order' && !task.hasActiveOrder);
      const matchesDepartment = filterDepartment === 'all' || task.department === filterDepartment;
      return matchesStatus && matchesPriority && matchesDepartment && matchesOrderStatus;
    });
  }, [tasksWithStatuses, filterStatus, filterPriority, filterDepartment, filterOrderStatus]);

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
      withOrder: tasksWithStatuses.filter(t => t.hasActiveOrder).length,
      withoutOrder: tasksWithStatuses.filter(t => !t.hasActiveOrder).length,
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

  const handleGenerateOrder = (taskId: string, orderType: string) => {
    const task = tasksWithStatuses.find(t => t.id === taskId);
    if (!task) return;

    setSelectedTasks(new Set([taskId]));
    setMassActionType(orderType);
    setShowMassActionDialog(true);
    
    // Автоматически переводим задачу в статус "В работе"
    if (task.status === 'pending') {
      handleTaskStatusChange(taskId, 'in_progress');
    }
  };

  const handleBulkGenerateOrder = (orderType: string) => {
    setMassActionType(orderType);
    setShowMassActionDialog(true);
    
    // Автоматически переводим выбранные задачи в статус "В работе"
    const updates: Record<string, { status: 'in_progress', completedAt?: string }> = {};
    selectedTasks.forEach(taskId => {
      const task = tasksWithStatuses.find(t => t.id === taskId);
      if (task && task.status === 'pending') {
        updates[taskId] = { status: 'in_progress' };
      }
    });
    setTaskStatuses(prev => ({ ...prev, ...updates }));
  };

  const getSelectedEmployees = () => {
    const uniqueEmployees = new Map<string, any>();
    
    tasksWithStatuses
      .filter(task => selectedTasks.has(task.id))
      .forEach(task => {
        if (!uniqueEmployees.has(task.employeeId)) {
          const employeeCerts = certifications.filter(c => c.personnelId === task.employeeId);
          
          uniqueEmployees.set(task.employeeId, {
            id: task.employeeId,
            name: task.employeeName,
            position: task.employeePosition,
            department: task.department,
            organization: user?.tenantId || '',
            certifications: employeeCerts.map(cert => {
              const { status, daysLeft } = getCertificationStatus(cert.expiryDate);
              return {
                id: cert.id,
                category: cert.category,
                area: cert.area,
                issueDate: cert.issueDate,
                expiryDate: cert.expiryDate,
                status,
                daysLeft
              };
            })
          });
        }
      });
    
    return Array.from(uniqueEmployees.values());
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 text-white">
              <Icon name="Info" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Автоматический контроль сроков аттестаций
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Система автоматически создаёт задачи-напоминания о необходимости продления аттестаций сотрудников. 
                Чтобы взять задачу в работу — создайте приказ на обучение или аттестацию. После создания приказа задача автоматически перейдёт в статус "В работе".
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <div className="flex items-center justify-center w-6 h-6 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    <Icon name="Clock" size={14} />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">За 90 дней</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Низкий приоритет</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="flex items-center justify-center w-6 h-6 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                    <Icon name="Clock" size={14} />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">За 60 дней</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Средний приоритет</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="flex items-center justify-center w-6 h-6 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                    <Icon name="AlertCircle" size={14} />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">За 30 дней</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Высокий приоритет</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="flex items-center justify-center w-6 h-6 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    <Icon name="AlertTriangle" size={14} />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Просрочено</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Критический</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <TaskStatisticsCards statistics={statistics} />

      {(statistics.withOrder > 0 || statistics.withoutOrder > 0) && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 text-white">
                  <Icon name="FileText" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Статус формирования приказов</h3>
                  <p className="text-sm text-muted-foreground">Отслеживайте созданные приказы</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{statistics.withOrder}</div>
                  <p className="text-xs text-muted-foreground mt-1">С приказом</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{statistics.withoutOrder}</div>
                  <p className="text-xs text-muted-foreground mt-1">Без приказа</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {statistics.total > 0 ? Math.round((statistics.withOrder / statistics.total) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Покрытие</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Список задач</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Отслеживайте и управляйте задачами по продлению аттестаций
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
              filterOrderStatus={filterOrderStatus}
              setFilterOrderStatus={setFilterOrderStatus}
              departments={departments}
              selectedTasksCount={selectedTasks.size}
              onBulkCompleted={() => handleBulkStatusChange('completed')}
              onBulkGenerateOrder={handleBulkGenerateOrder}
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
                <div className="text-center py-12">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30">
                    <Icon name="CheckCircle2" size={32} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {tasksWithStatuses.length === 0 ? 'Отлично! Все аттестации актуальны' : 'Нет задач по выбранным фильтрам'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {tasksWithStatuses.length === 0 
                      ? 'Задачи появятся автоматически, когда сроки аттестаций приблизятся к истечению'
                      : 'Измените фильтры, чтобы увидеть другие задачи'}
                  </p>
                  {tasksWithStatuses.length === 0 && (
                    <Button variant="outline" onClick={() => window.location.href = '/attestation?tab=employees'} className="gap-2">
                      <Icon name="Users" size={16} />
                      Перейти к сотрудникам
                    </Button>
                  )}
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
                    onGenerateOrder={(orderType) => handleGenerateOrder(task.id, orderType)}
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

      <MassActionDialog
        open={showMassActionDialog}
        onOpenChange={setShowMassActionDialog}
        actionType={massActionType}
        employees={getSelectedEmployees()}
      />
    </div>
  );
}