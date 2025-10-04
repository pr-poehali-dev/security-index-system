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
  
  addTask: (task) => {
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