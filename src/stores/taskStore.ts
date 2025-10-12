import { create } from 'zustand';
import type { Task } from '@/types/tasks';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  filters: {
    status: Task['status'] | 'all';
    priority: Task['priority'] | 'all';
    type: Task['type'] | 'all';
    assignedTo: string | 'all';
  };
  error: string | null;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  selectTask: (task: Task | null) => void;
  completeTask: (id: string) => void;
  
  // Filters
  setFilters: (filters: Partial<TaskState['filters']>) => void;
  getFilteredTasks: () => Task[];
  
  // Getters
  getTasksByAssignee: (userId: string) => Task[];
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
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [
    {
      id: 'task-1',
      tenantId: 'tenant-1',
      title: 'Устранить утечку на котле №2',
      description: 'Необходимо заменить фланцевое соединение и провести опрессовку',
      priority: 'high',
      status: 'in_progress',
      type: 'corrective_action',
      source: 'incident',
      sourceId: 'inc-1',
      createdBy: '3',
      createdByName: 'Аудитор',
      assignedTo: '4',
      assignedToName: 'Менеджер',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      objectId: 'obj-1',
      objectName: 'Котельная №1',
      comments: [],
      attachments: [],
      timeline: [
        {
          id: 'event-1',
          taskId: 'task-1',
          eventType: 'created',
          description: 'Задача создана из инцидента',
          userId: '3',
          userName: 'Аудитор',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'event-2',
          taskId: 'task-1',
          eventType: 'assigned',
          description: 'Задача назначена исполнителю',
          userId: '3',
          userName: 'Аудитор',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 300000).toISOString()
        },
        {
          id: 'event-3',
          taskId: 'task-1',
          eventType: 'status_changed',
          description: 'Статус изменен на "В работе"',
          userId: '4',
          userName: 'Менеджер',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  ],
  
  selectedTask: null,
  
  filters: {
    status: 'all',
    priority: 'all',
    type: 'all',
    assignedTo: 'all'
  },
  
  error: null,
  
  addTask: (task) => {
    try {
      const id = `task-${Date.now()}`;
      const createdAt = new Date().toISOString();
      const newTask: Task = {
        ...task,
        id,
        createdAt,
        updatedAt: createdAt,
        comments: [],
        attachments: [],
        timeline: [
          {
            id: `event-${Date.now()}`,
            taskId: id,
            eventType: 'created',
            description: 'Задача создана',
            userId: task.createdBy,
            userName: task.createdByName,
            createdAt
          }
        ]
      };
      set((state) => ({ 
        tasks: [...state.tasks, newTask],
        error: null
      }));
      return newTask;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при создании задачи';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  updateTask: (id, updates) => {
    try {
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        ),
        selectedTask: state.selectedTask?.id === id
          ? { ...state.selectedTask, ...updates, updatedAt: new Date().toISOString() }
          : state.selectedTask,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при обновлении задачи';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  deleteTask: (id) => {
    try {
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при удалении задачи';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  selectTask: (task) => {
    set({ selectedTask: task, error: null });
  },
  
  completeTask: (id) => {
    try {
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, status: 'completed', completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            : task
        ),
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при завершении задачи';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },
  
  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.type !== 'all' && task.type !== filters.type) return false;
      if (filters.assignedTo !== 'all' && task.assignedTo !== filters.assignedTo) return false;
      return true;
    });
  },
  
  getTasksByAssignee: (userId) => {
    return get().tasks.filter((task) => task.assignedTo === userId);
  },
  
  getTasksByStatus: (status) => {
    return get().tasks.filter((task) => task.status === status);
  },
  
  getOverdueTasks: () => {
    const now = new Date();
    return get().tasks.filter((task) => {
      if (task.status === 'completed' || task.status === 'cancelled') return false;
      return task.dueDate && new Date(task.dueDate) < now;
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
        (t) => t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate && new Date(t.dueDate) < now
      ).length,
      critical: tasks.filter((t) => t.priority === 'critical' && t.status !== 'completed').length
    };
  },
  
  setError: (error) => {
    set({ error });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));