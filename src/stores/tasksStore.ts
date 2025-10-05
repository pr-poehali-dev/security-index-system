import { create } from 'zustand';
import type { Task } from '@/types';

interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  filters: {
    status: Task['status'] | 'all';
    priority: Task['priority'] | 'all';
    assignedTo: string | 'all';
    type: Task['type'] | 'all';
  };
  setFilters: (filters: Partial<TasksState['filters']>) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  selectTask: (task: Task | null) => void;
  completeTask: (id: string) => void;
  getFilteredTasks: () => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
  getOverdueTasks: () => Task[];
  getTaskStats: () => {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    overdue: number;
    critical: number;
  };
}

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    tenantId: 'tenant-1',
    title: 'Устранить замечания по пожарной безопасности',
    description: 'Обнаружены нарушения хранения огнетушителей в цехе №3',
    type: 'corrective_action',
    priority: 'critical',
    status: 'open',
    assignedTo: 'Иванов И.И.',
    createdBy: 'Петров П.П.',
    dueDate: '2024-10-10',
    sourceType: 'audit',
    sourceId: 'audit-1'
  },
  {
    id: '2',
    tenantId: 'tenant-1',
    title: 'Провести внеплановую проверку оборудования',
    description: 'После инцидента требуется диагностика компрессора К-301',
    type: 'audit',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'Сидоров С.С.',
    createdBy: 'Администратор',
    dueDate: '2024-10-08',
    sourceType: 'incident',
    sourceId: 'incident-1'
  },
  {
    id: '3',
    tenantId: 'tenant-1',
    title: 'Заменить масло в насосе Н-12',
    description: 'Плановое техническое обслуживание согласно графику',
    type: 'maintenance',
    priority: 'medium',
    status: 'open',
    assignedTo: 'Козлов А.В.',
    createdBy: 'Система',
    dueDate: '2024-10-15'
  },
  {
    id: '4',
    tenantId: 'tenant-1',
    title: 'Провести аттестацию Смирновой А.П.',
    description: 'Истекает срок действия сертификата по ПБ',
    type: 'other',
    priority: 'high',
    status: 'open',
    assignedTo: 'Кадровая служба',
    createdBy: 'Система',
    dueDate: '2024-10-20'
  },
  {
    id: '5',
    tenantId: 'tenant-1',
    title: 'Обновить инструкции по охране труда',
    description: 'Изменились нормативные требования',
    type: 'other',
    priority: 'low',
    status: 'completed',
    assignedTo: 'Иванов И.И.',
    createdBy: 'Администратор',
    dueDate: '2024-09-30',
    completedAt: '2024-09-28'
  }
];

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: MOCK_TASKS,
  selectedTask: null,
  filters: {
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    type: 'all'
  },

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  addTask: (taskData) => set((state) => ({
    tasks: [
      ...state.tasks,
      {
        ...taskData,
        id: `task-${Date.now()}`
      }
    ]
  })),

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ),
    selectedTask: state.selectedTask?.id === id 
      ? { ...state.selectedTask, ...updates } 
      : state.selectedTask
  })),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
    selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
  })),

  selectTask: (task) => set({ selectedTask: task }),

  completeTask: (id) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id
        ? { ...task, status: 'completed', completedAt: new Date().toISOString() }
        : task
    )
  })),

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.assignedTo !== 'all' && task.assignedTo !== filters.assignedTo) return false;
      if (filters.type !== 'all' && task.type !== filters.type) return false;
      return true;
    });
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((task) => task.status === status);
  },

  getOverdueTasks: () => {
    const now = new Date();
    return get().tasks.filter((task) => {
      if (task.status === 'completed' || task.status === 'cancelled') return false;
      return new Date(task.dueDate) < now;
    });
  },

  getTaskStats: () => {
    const { tasks } = get();
    const now = new Date();
    
    return {
      total: tasks.length,
      open: tasks.filter((t) => t.status === 'open').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      overdue: tasks.filter(
        (t) => t.status !== 'completed' && t.status !== 'cancelled' && new Date(t.dueDate) < now
      ).length,
      critical: tasks.filter((t) => t.priority === 'critical' && t.status !== 'completed').length
    };
  }
}));
