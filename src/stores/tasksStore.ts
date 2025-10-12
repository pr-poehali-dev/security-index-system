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
  tasks: [
    {
      id: 'task-1',
      tenantId: 'tenant-1',
      incidentId: 'inc-1',
      title: 'Провести внеочередную проверку сосудов под давлением',
      description: 'Организовать и провести внеочередную проверку технического состояния сосудов под давлением с привлечением внешней экспертной организации',
      assignedTo: 'pers-1',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2025-02-10',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'task-2',
      tenantId: 'tenant-1',
      incidentId: 'inc-1',
      title: 'Организовать обучение персонала по промбезопасности',
      description: 'Направить операторов на обучение и аттестацию по промышленной безопасности в аккредитованный учебный центр',
      assignedTo: 'pers-2',
      status: 'pending',
      priority: 'high',
      dueDate: '2025-02-15',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'task-3',
      tenantId: 'tenant-1',
      incidentId: 'inc-2',
      title: 'Замена СИЗ на участке',
      description: 'Произвести замену неисправных СИЗ и провести проверку всех средств защиты на участке',
      assignedTo: 'pers-2',
      status: 'completed',
      priority: 'medium',
      dueDate: '2025-01-20',
      completedDate: '2025-01-18',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'task-4',
      tenantId: 'tenant-1',
      incidentId: 'inc-3',
      title: 'Установка системы контроля энергопотребления',
      description: 'Разработать ТЗ, выбрать подрядчика и установить автоматическую систему мониторинга энергопотребления',
      assignedTo: 'pers-1',
      status: 'overdue',
      priority: 'critical',
      dueDate: '2025-01-05',
      createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'task-5',
      tenantId: 'tenant-1',
      incidentId: 'inc-4',
      title: 'Закупка огнетушителей для участка №3',
      description: 'Рассчитать необходимое количество, согласовать с бюджетом и закупить огнетушители согласно нормам пожарной безопасности',
      assignedTo: 'pers-3',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2025-10-13',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'task-6',
      tenantId: 'tenant-1',
      incidentId: 'inc-5',
      title: 'Остановка крана и проведение внепланового ТО',
      description: 'Немедленно остановить эксплуатацию крана, организовать внеплановое техническое обслуживание с проверкой всех механизмов',
      assignedTo: 'pers-2',
      status: 'overdue',
      priority: 'critical',
      dueDate: '2024-12-01',
      createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

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