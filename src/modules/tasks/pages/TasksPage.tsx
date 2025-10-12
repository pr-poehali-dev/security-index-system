import { useState, useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import TaskTableView from '../components/TaskTableView';
import DataPagination from '@/components/ui/data-pagination';
import type { Task } from '@/types/tasks';

export default function TasksPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);
  const {
    tasks,
    filters,
    setFilters,
    getFilteredTasks,
    getTaskStats,
    getOverdueTasks,
    completeTask
  } = useTaskStore();
  
  const user = useAuthStore((state) => state.user);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentTab, setCurrentTab] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredTasks = getFilteredTasks();
  const stats = getTaskStats();
  const overdueTasks = getOverdueTasks();

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: Task['type']) => {
    switch (type) {
      case 'corrective_action': return 'Корректирующее действие';
      case 'maintenance': return 'Обслуживание';
      case 'audit': return 'Аудит';
      case 'other': return 'Прочее';
    }
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'Критический';
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'open': return 'Открыта';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершена';
      case 'cancelled': return 'Отменена';
    }
  };

  const tasksBeforePagination = currentTab === 'all' ? filteredTasks : 
                        currentTab === 'overdue' ? overdueTasks :
                        filteredTasks.filter(t => t.status === currentTab);
  
  const totalTasks = tasksBeforePagination.length;
  const totalPages = Math.ceil(totalTasks / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const tasksToDisplay = tasksBeforePagination.slice(startIndex, endIndex);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [currentTab, filters]);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Управление задачами"
          description="Постановка и контроль выполнения задач по промышленной безопасности"
          icon="ListTodo"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg mb-6" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Управление задачами"
        description="Постановка и контроль выполнения задач по промышленной безопасности"
        icon="ListTodo"
        action={
          <Button className="gap-2" aria-label="Создать задачу">
            <Icon name="Plus" size={18} />
            Создать задачу
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="ListTodo" className="text-gray-600" size={20} />
              <span className="text-2xl md:text-3xl font-bold">{stats.total}</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Всего задач</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Circle" className="text-blue-600" size={20} />
              <span className="text-2xl md:text-3xl font-bold">{stats.open}</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Открыто</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Clock" className="text-purple-600" size={20} />
              <span className="text-2xl md:text-3xl font-bold">{stats.inProgress}</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">В работе</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle2" className="text-green-600" size={20} />
              <span className="text-2xl md:text-3xl font-bold">{stats.completed}</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Завершено</p>
          </CardContent>
        </Card>

        <Card className={stats.overdue > 0 ? 'border-red-300 bg-red-50' : ''}>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="AlertTriangle" className="text-red-600" size={20} />
              <span className="text-2xl md:text-3xl font-bold text-red-600">{stats.overdue}</span>
            </div>
            <p className="text-xs md:text-sm text-red-600 font-medium">Просрочено</p>
          </CardContent>
        </Card>
      </div>

      {stats.critical > 0 && (
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Icon name="AlertCircle" className="text-red-600" size={24} />
              <div>
                <p className="font-semibold text-red-900">Внимание!</p>
                <p className="text-sm text-red-700">
                  {stats.critical} критических задач требуют немедленного внимания
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Фильтры</CardTitle>
            <div className="flex gap-1 border rounded-lg p-1" role="group" aria-label="Режим отображения">
              <Button
                variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                aria-label="Режим карточек"
                title="Карточки"
              >
                <Icon name="LayoutGrid" size={16} />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                aria-label="Режим таблицы"
                onClick={() => setViewMode('table')}
                title="Таблица"
              >
                <Icon name="Table" size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по названию, описанию или объекту..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-10"
                aria-label="Поиск задач"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div>
              <label htmlFor="status-filter" className="text-sm font-medium mb-2 block">Статус</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ status: value as any })}>
                <SelectTrigger id="status-filter" aria-label="Фильтр по статусу">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="open">Открыта</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="completed">Завершена</SelectItem>
                  <SelectItem value="cancelled">Отменена</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="priority-filter" className="text-sm font-medium mb-2 block">Приоритет</label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({ priority: value as any })}>
                <SelectTrigger id="priority-filter" aria-label="Фильтр по приоритету">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="type-filter" className="text-sm font-medium mb-2 block">Тип задачи</label>
              <Select value={filters.type} onValueChange={(value) => setFilters({ type: value as any })}>
                <SelectTrigger id="type-filter" aria-label="Фильтр по типу задачи">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="corrective_action">Корректирующее действие</SelectItem>
                  <SelectItem value="maintenance">Обслуживание</SelectItem>
                  <SelectItem value="audit">Аудит</SelectItem>
                  <SelectItem value="other">Прочее</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="assignee-filter" className="text-sm font-medium mb-2 block">Исполнитель</label>
              <Select value={filters.assignedTo} onValueChange={(value) => setFilters({ assignedTo: value })}>
                <SelectTrigger id="assignee-filter" aria-label="Фильтр по исполнителю">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="Иванов И.И.">Иванов И.И.</SelectItem>
                  <SelectItem value="Сидоров С.С.">Сидоров С.С.</SelectItem>
                  <SelectItem value="Козлов А.В.">Козлов А.В.</SelectItem>
                  <SelectItem value="Кадровая служба">Кадровая служба</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="all" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="ListTodo" size={20} />
            <span className="text-xs font-medium">Все ({filteredTasks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="open" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Circle" size={20} />
            <span className="text-xs font-medium">Открытые ({stats.open})</span>
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Clock" size={20} />
            <span className="text-xs font-medium">В работе ({stats.inProgress})</span>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
            <Icon name="AlertTriangle" size={20} />
            <span className="text-xs font-medium">Просроченные ({stats.overdue})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-6">
          {viewMode === 'table' ? (
            <TaskTableView tasks={tasksToDisplay} onTaskClick={(task) => setSelectedTask(task)} />
          ) : (
            <div className="space-y-4">
            {tasksToDisplay.map((task) => {
              const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'cancelled';

              return (
                <Card key={task.id} className={isOverdue ? 'border-red-300' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          {task.sourceType && (
                            <Badge variant="outline" className="text-xs">
                              {task.sourceType === 'incident' ? 'Из инцидента' : 
                               task.sourceType === 'audit' ? 'Из аудита' : 'Из чек-листа'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusLabel(task.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Тип</p>
                        <p className="font-medium">{getTypeLabel(task.type)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Исполнитель</p>
                        <p className="font-medium">{task.assignedTo}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Срок выполнения</p>
                        <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                          {isOverdue && <Icon name="AlertTriangle" size={14} className="inline mr-1" />}
                          {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Создал</p>
                        <p className="font-medium">{task.createdBy}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Icon name="Eye" className="mr-2" size={14} />
                        Подробнее
                      </Button>
                      {task.status === 'open' && (
                        <Button size="sm" variant="secondary">
                          <Icon name="Play" className="mr-2" size={14} />
                          Начать работу
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button size="sm" onClick={() => completeTask(task.id)}>
                          <Icon name="Check" className="mr-2" size={14} />
                          Завершить
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {tasksToDisplay.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="CheckCircle2" className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-500">Задачи не найдены</p>
                </CardContent>
              </Card>
            )}
            {totalTasks > 0 && (
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalTasks}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}