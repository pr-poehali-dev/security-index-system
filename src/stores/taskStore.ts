import { create } from 'zustand';
import type { Task } from '@/types/tasks';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  getTasksByAssignee: (userId: string) => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
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
      objectName: 'Котельная №1'
    }
  ],
  
  addTask: (task) => {
    const id = `task-${Date.now()}`;
    const newTask: Task = {
      ...task,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    return id;
  },
  
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
      )
    }));
  },
  
  getTasksByAssignee: (userId) => {
    return get().tasks.filter((task) => task.assignedTo === userId);
  },
  
  getTasksByStatus: (status) => {
    return get().tasks.filter((task) => task.status === status);
  }
}));
