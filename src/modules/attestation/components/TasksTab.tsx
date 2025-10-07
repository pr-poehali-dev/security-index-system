import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  type: 'reminder_90' | 'reminder_60' | 'reminder_30' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'critical';
  employeeName: string;
  employeeId: string;
  employeePosition: string;
  department: string;
  category: string;
  area: string;
  expiryDate: string;
  daysLeft: number;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  completedAt?: string;
}

const mockEmployees = [
  {
    id: '1',
    name: 'Иванов Иван Иванович',
    position: 'Инженер',
    department: 'Производство',
    certifications: [
      {
        id: '1-1',
        category: 'Промышленная безопасность',
        area: 'А.1 Основы промышленной безопасности',
        expiryDate: '2028-01-01',
        status: 'valid',
        daysLeft: 1182
      }
    ]
  },
  {
    id: '2',
    name: 'Петрова Анна Сергеевна',
    position: 'Начальник участка',
    department: 'Производство',
    certifications: [
      {
        id: '2-1',
        category: 'Электробезопасность',
        area: 'IV группа до 1000В',
        expiryDate: '2025-12-20',
        status: 'expiring_soon',
        daysLeft: 74
      }
    ]
  },
  {
    id: '3',
    name: 'Сидоров Петр Николаевич',
    position: 'Техник',
    department: 'Ремонт',
    certifications: [
      {
        id: '3-1',
        category: 'Работа на высоте',
        area: '3 группа',
        expiryDate: '2025-11-15',
        status: 'expiring_soon',
        daysLeft: 39
      }
    ]
  },
  {
    id: '4',
    name: 'Козлов Михаил Андреевич',
    position: 'Электромонтёр',
    department: 'Энергоцех',
    certifications: [
      {
        id: '4-1',
        category: 'Электробезопасность',
        area: 'V группа до и выше 1000В',
        expiryDate: '2025-10-25',
        status: 'expiring_soon',
        daysLeft: 18
      }
    ]
  },
  {
    id: '5',
    name: 'Морозова Елена Викторовна',
    position: 'Лаборант',
    department: 'Лаборатория',
    certifications: [
      {
        id: '5-1',
        category: 'Промышленная безопасность',
        area: 'Б.7 Эксплуатация газового оборудования',
        expiryDate: '2025-08-14',
        status: 'expired',
        daysLeft: -67
      }
    ]
  }
];

const generateTasks = (): Task[] => {
  const tasks: Task[] = [];
  const now = new Date();

  mockEmployees.forEach(emp => {
    emp.certifications.forEach(cert => {
      const expiryDate = new Date(cert.expiryDate);
      const daysLeft = cert.daysLeft;

      if (daysLeft < 0) {
        tasks.push({
          id: `task-${emp.id}-${cert.id}-expired`,
          type: 'expired',
          priority: 'critical',
          employeeName: emp.name,
          employeeId: emp.id,
          employeePosition: emp.position,
          department: emp.department,
          category: cert.category,
          area: cert.area,
          expiryDate: cert.expiryDate,
          daysLeft: cert.daysLeft,
          createdAt: new Date(expiryDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        });
      } else if (daysLeft <= 30) {
        tasks.push({
          id: `task-${emp.id}-${cert.id}-30`,
          type: 'reminder_30',
          priority: 'high',
          employeeName: emp.name,
          employeeId: emp.id,
          employeePosition: emp.position,
          department: emp.department,
          category: cert.category,
          area: cert.area,
          expiryDate: cert.expiryDate,
          daysLeft: cert.daysLeft,
          createdAt: new Date(expiryDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        });
      } else if (daysLeft <= 60) {
        tasks.push({
          id: `task-${emp.id}-${cert.id}-60`,
          type: 'reminder_60',
          priority: 'medium',
          employeeName: emp.name,
          employeeId: emp.id,
          employeePosition: emp.position,
          department: emp.department,
          category: cert.category,
          area: cert.area,
          expiryDate: cert.expiryDate,
          daysLeft: cert.daysLeft,
          createdAt: new Date(expiryDate.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        });
      } else if (daysLeft <= 90) {
        tasks.push({
          id: `task-${emp.id}-${cert.id}-90`,
          type: 'reminder_90',
          priority: 'low',
          employeeName: emp.name,
          employeeId: emp.id,
          employeePosition: emp.position,
          department: emp.department,
          category: cert.category,
          area: cert.area,
          expiryDate: cert.expiryDate,
          daysLeft: cert.daysLeft,
          createdAt: new Date(expiryDate.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        });
      }
    });
  });

  return tasks.sort((a, b) => a.daysLeft - b.daysLeft);
};

export default function TasksTab() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(generateTasks());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [autoCreateEnabled, setAutoCreateEnabled] = useState(true);

  const departments = Array.from(new Set(tasks.map(t => t.department)));

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesDepartment = filterDepartment === 'all' || task.department === filterDepartment;
      return matchesStatus && matchesPriority && matchesDepartment;
    });
  }, [tasks, filterStatus, filterPriority, filterDepartment]);

  const statistics = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      critical: tasks.filter(t => t.priority === 'critical').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };
  }, [tasks]);

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'reminder_90': return 'Напоминание (90 дн.)';
      case 'reminder_60': return 'Напоминание (60 дн.)';
      case 'reminder_30': return 'Напоминание (30 дн.)';
      case 'expired': return 'Просрочено';
      default: return type;
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder_90': return 'Bell';
      case 'reminder_60': return 'AlertCircle';
      case 'reminder_30': return 'AlertTriangle';
      case 'expired': return 'XCircle';
      default: return 'Circle';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300';
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Выполнено';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const handleTaskStatusChange = (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return task;
    }));

    toast({
      title: "Статус обновлён",
      description: `Задача переведена в статус "${getStatusLabel(newStatus)}"`,
    });
  };

  const handleBulkStatusChange = (newStatus: 'in_progress' | 'completed') => {
    if (selectedTasks.size === 0) return;

    setTasks(prev => prev.map(task => {
      if (selectedTasks.has(task.id)) {
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return task;
    }));

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

  const handleRegenerateTasks = () => {
    const newTasks = generateTasks();
    setTasks(newTasks);
    toast({
      title: "Задачи обновлены",
      description: `Сгенерировано задач: ${newTasks.length}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="ListTodo" className="text-blue-600" size={24} />
              <span className="text-2xl font-bold">{statistics.total}</span>
            </div>
            <p className="text-sm text-muted-foreground">Всего задач</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Clock" className="text-amber-600" size={24} />
              <span className="text-2xl font-bold">{statistics.pending}</span>
            </div>
            <p className="text-sm text-muted-foreground">Ожидают выполнения</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="PlayCircle" className="text-purple-600" size={24} />
              <span className="text-2xl font-bold">{statistics.inProgress}</span>
            </div>
            <p className="text-sm text-muted-foreground">В работе</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
              <span className="text-2xl font-bold">{statistics.completed}</span>
            </div>
            <p className="text-sm text-muted-foreground">Выполнено</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Автоматические задачи</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Задачи создаются автоматически за 90/60/30 дней до истечения аттестаций
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateTasks}
                className="gap-2"
              >
                <Icon name="RefreshCw" size={16} />
                Обновить задачи
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="pending">Ожидает</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="completed">Выполнено</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Все приоритеты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Все подразделения" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все подразделения</SelectItem>
                  {departments.map(dep => (
                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTasks.size > 0 && (
              <div className="flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="text-sm font-medium">
                  Выбрано: {selectedTasks.size}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusChange('in_progress')}
                  className="gap-2"
                >
                  <Icon name="PlayCircle" size={14} />
                  Взять в работу
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusChange('completed')}
                  className="gap-2"
                >
                  <Icon name="CheckCircle2" size={14} />
                  Отметить выполненными
                </Button>
              </div>
            )}

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
                  <Card
                    key={task.id}
                    className={`cursor-pointer transition-all ${
                      selectedTasks.has(task.id) ? 'ring-2 ring-primary' : ''
                    } ${
                      task.status === 'completed' ? 'opacity-60' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedTasks.has(task.id)}
                          onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Icon
                                name={getTaskTypeIcon(task.type)}
                                size={18}
                                className={
                                  task.priority === 'critical' ? 'text-red-600' :
                                  task.priority === 'high' ? 'text-orange-600' :
                                  task.priority === 'medium' ? 'text-amber-600' :
                                  'text-blue-600'
                                }
                              />
                              <span className="font-medium">{getTaskTypeLabel(task.type)}</span>
                              <Badge className={getPriorityColor(task.priority)}>
                                {getPriorityLabel(task.priority)}
                              </Badge>
                              <Badge variant={getStatusColor(task.status) as any}>
                                {getStatusLabel(task.status)}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-1 mb-3">
                            <p className="font-medium text-base">{task.employeeName}</p>
                            <p className="text-sm text-muted-foreground">
                              {task.employeePosition} • {task.department}
                            </p>
                            <p className="text-sm">{task.area}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Icon name="Tag" size={12} />
                                {task.category}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Calendar" size={12} />
                                Срок: {new Date(task.expiryDate).toLocaleDateString('ru-RU')}
                              </span>
                              <span className={`flex items-center gap-1 font-medium ${
                                task.daysLeft < 0 ? 'text-red-600' :
                                task.daysLeft <= 30 ? 'text-orange-600' :
                                task.daysLeft <= 60 ? 'text-amber-600' :
                                'text-blue-600'
                              }`}>
                                <Icon name="Clock" size={12} />
                                {task.daysLeft > 0 ? `Осталось ${task.daysLeft} дн.` : `Просрочено на ${Math.abs(task.daysLeft)} дн.`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {task.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskStatusChange(task.id, 'in_progress');
                                }}
                                className="gap-2"
                              >
                                <Icon name="PlayCircle" size={14} />
                                Взять в работу
                              </Button>
                            )}
                            {task.status === 'in_progress' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskStatusChange(task.id, 'completed');
                                }}
                                className="gap-2"
                              >
                                <Icon name="CheckCircle2" size={14} />
                                Завершить
                              </Button>
                            )}
                            {task.status === 'completed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskStatusChange(task.id, 'pending');
                                }}
                                className="gap-2"
                              >
                                <Icon name="RotateCcw" size={14} />
                                Вернуть в работу
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                              }}
                              className="gap-2"
                            >
                              <Icon name="Eye" size={14} />
                              Подробнее
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Статистика по приоритетам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Критический</span>
                <Badge className="bg-red-600 text-white">{statistics.critical}</Badge>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400">Требуют немедленных действий</p>
            </div>

            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Высокий</span>
                <Badge className="bg-orange-600 text-white">{statistics.high}</Badge>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400">Требуют срочного внимания</p>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Средний</span>
                <Badge className="bg-amber-600 text-white">{statistics.medium}</Badge>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400">Требуют планирования</p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Низкий</span>
                <Badge className="bg-blue-600 text-white">{statistics.low}</Badge>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">Можно выполнить позже</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedTask !== null} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Детали задачи</DialogTitle>
            <DialogDescription>
              {selectedTask && getTaskTypeLabel(selectedTask.type)}
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Приоритет</p>
                  <Badge className={getPriorityColor(selectedTask.priority)}>
                    {getPriorityLabel(selectedTask.priority)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Статус</p>
                  <Badge variant={getStatusColor(selectedTask.status) as any}>
                    {getStatusLabel(selectedTask.status)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <h4 className="font-medium">Сотрудник</h4>
                <p className="text-base">{selectedTask.employeeName}</p>
                <p className="text-sm text-muted-foreground">{selectedTask.employeePosition}</p>
                <p className="text-sm text-muted-foreground">{selectedTask.department}</p>
              </div>

              <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <h4 className="font-medium">Аттестация</h4>
                <p className="text-sm"><strong>Категория:</strong> {selectedTask.category}</p>
                <p className="text-sm"><strong>Область:</strong> {selectedTask.area}</p>
                <p className="text-sm">
                  <strong>Срок действия:</strong> {new Date(selectedTask.expiryDate).toLocaleDateString('ru-RU')}
                </p>
                <p className={`text-sm font-medium ${
                  selectedTask.daysLeft < 0 ? 'text-red-600' :
                  selectedTask.daysLeft <= 30 ? 'text-orange-600' :
                  selectedTask.daysLeft <= 60 ? 'text-amber-600' :
                  'text-blue-600'
                }`}>
                  {selectedTask.daysLeft > 0 
                    ? `Осталось ${selectedTask.daysLeft} дней` 
                    : `Просрочено на ${Math.abs(selectedTask.daysLeft)} дней`
                  }
                </p>
              </div>

              <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <h4 className="font-medium">Информация о задаче</h4>
                <p className="text-sm">
                  <strong>Создана:</strong> {new Date(selectedTask.createdAt).toLocaleDateString('ru-RU')}
                </p>
                {selectedTask.completedAt && (
                  <p className="text-sm">
                    <strong>Завершена:</strong> {new Date(selectedTask.completedAt).toLocaleDateString('ru-RU')}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
