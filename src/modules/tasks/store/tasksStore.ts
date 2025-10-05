import { create } from 'zustand';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'corrective_action' | 'maintenance' | 'audit' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  createdAt: string;
  sourceType?: 'incident' | 'audit' | 'checklist';
  sourceId?: string;
}

interface TaskFilters {
  status: string;
  priority: string;
  type: string;
  assignedTo: string;
}

interface TasksState {
  tasks: Task[];
  filters: TaskFilters;
  setFilters: (filters: Partial<TaskFilters>) => void;
  getFilteredTasks: () => Task[];
  getTaskStats: () => {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    overdue: number;
    critical: number;
  };
  getOverdueTasks: () => Task[];
  completeTask: (id: string) => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [
    {
      id: '1',
      title: 'Провести внеплановую проверку КОД',
      description: 'После инцидента необходимо проверить состояние контейнера',
      type: 'corrective_action',
      priority: 'critical',
      status: 'open',
      assignedTo: 'Иванов И.И.',
      createdBy: 'Петров П.П.',
      dueDate: '2024-01-15',
      createdAt: '2024-01-10',
      sourceType: 'incident',
      sourceId: 'INC-001'
    }
  ],
  
  filters: {
    status: 'all',
    priority: 'all',
    type: 'all',
    assignedTo: 'all'
  },

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter(task => {
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.type !== 'all' && task.type !== filters.type) return false;
      if (filters.assignedTo !== 'all' && task.assignedTo !== filters.assignedTo) return false;
      return true;
    });
  },

  getTaskStats: () => {
    const { tasks } = get();
    const now = new Date();
    
    return {
      total: tasks.length,
      open: tasks.filter(t => t.status === 'open').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => 
        new Date(t.dueDate) < now && 
        t.status !== 'completed' && 
        t.status !== 'cancelled'
      ).length,
      critical: tasks.filter(t => t.priority === 'critical').length
    };
  },

  getOverdueTasks: () => {
    const { tasks } = get();
    const now = new Date();
    return tasks.filter(t => 
      new Date(t.dueDate) < now && 
      t.status !== 'completed' && 
      t.status !== 'cancelled'
    );
  },

  completeTask: (id) => set((state) => ({
    tasks: state.tasks.map(task =>
      task.id === id ? { ...task, status: 'completed' as const } : task
    )
  }))
}));
