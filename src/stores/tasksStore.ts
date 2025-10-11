import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '@/types';

interface TasksState {
  tasks: Task[];
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByTenant: (tenantId: string) => Task[];
  getTasksByIncident: (incidentId: string) => Task[];
}

export const useTasksStore = create<TasksState>()(persist((set, get) => ({
  tasks: [],

  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    return newTask;
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
      )
    }));
  },

  deleteTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
  },

  getTasksByTenant: (tenantId) => {
    return get().tasks.filter((task) => task.tenantId === tenantId);
  },

  getTasksByIncident: (incidentId) => {
    return get().tasks.filter((task) => task.incidentId === incidentId);
  }

}), { name: 'tasks-storage-v1' }));
