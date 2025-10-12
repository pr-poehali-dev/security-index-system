import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MaintenanceWork {
  id: string;
  tenantId: string;
  objectId: string;
  objectName: string;
  type: 'ТО' | 'Ремонт' | 'Замена';
  title: string;
  description?: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  executor: string;
  executorContact?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceState {
  works: MaintenanceWork[];
  
  addWork: (work: Omit<MaintenanceWork, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWork: (id: string, updates: Partial<MaintenanceWork>) => void;
  deleteWork: (id: string) => void;
  getWorksByStatus: (status: MaintenanceWork['status']) => MaintenanceWork[];
  getWorksByType: (type: MaintenanceWork['type']) => MaintenanceWork[];
  getWorksByObject: (objectId: string) => MaintenanceWork[];
  getStatistics: () => {
    planned: number;
    inProgress: number;
    completed: number;
    overdue: number;
    completionRate: number;
  };
}

export const useMaintenanceStore = create<MaintenanceState>()(persist((set, get) => ({
  works: [
    {
      id: 'work-1',
      tenantId: 'tenant-1',
      objectId: 'eq-2',
      objectName: 'Насос центробежный Н-12',
      type: 'ТО',
      title: 'Техническое обслуживание насоса',
      description: 'Замена масла, проверка уплотнений, диагностика подшипников',
      scheduledDate: '2025-10-25',
      status: 'planned',
      executor: 'Служба главного механика',
      executorContact: 'Иванов И.И., тел. 1234',
      notes: 'Подготовить расходные материалы заранее',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'work-2',
      tenantId: 'tenant-1',
      objectId: 'eq-1',
      objectName: 'Компрессор К-301',
      type: 'Замена',
      title: 'Замена воздушных фильтров',
      description: 'Плановая замена комплекта воздушных фильтров',
      scheduledDate: '2025-09-15',
      completedDate: '2025-09-15',
      status: 'completed',
      executor: 'ООО "СервисПром"',
      executorContact: '+7 495 123-00-00',
      notes: 'Работы выполнены в срок, оборудование работает в штатном режиме',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'work-3',
      tenantId: 'tenant-1',
      objectId: 'eq-3',
      objectName: 'Котел паровой КП-500',
      type: 'Ремонт',
      title: 'Ремонт системы автоматики',
      description: 'Устранение неисправностей контроллера, настройка параметров',
      scheduledDate: '2025-10-08',
      status: 'in_progress',
      executor: 'АО "АвтоматикаПром"',
      executorContact: '+7 495 999-88-77',
      notes: 'Работы начаты, завершение ожидается в ближайшие дни',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'work-4',
      tenantId: 'tenant-1',
      objectId: 'eq-4',
      objectName: 'Кран мостовой КМ-10',
      type: 'ТО',
      title: 'Годовое техническое обслуживание',
      description: 'Комплексное ТО крана: проверка механизмов, смазка, регулировка',
      scheduledDate: '2025-09-30',
      status: 'overdue',
      executor: 'Служба главного механика',
      executorContact: 'Петров П.П., тел. 5678',
      notes: 'ВНИМАНИЕ! Работы просрочены, требуется срочное выполнение',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'work-5',
      tenantId: 'tenant-1',
      objectId: 'eq-1',
      objectName: 'Компрессор К-301',
      type: 'Ремонт',
      title: 'Замена уплотнительных колец',
      description: 'Обнаружена утечка воздуха, требуется замена уплотнений',
      scheduledDate: '2025-10-18',
      status: 'planned',
      executor: 'ООО "СервисПром"',
      executorContact: '+7 495 123-00-00',
      notes: 'Детали заказаны, ожидается поставка',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  addWork: (work) => {
    const newWork: MaintenanceWork = {
      ...work,
      id: `work-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ works: [...state.works, newWork] }));
  },
  
  updateWork: (id, updates) => {
    set((state) => ({
      works: state.works.map((work) =>
        work.id === id ? { ...work, ...updates, updatedAt: new Date().toISOString() } : work
      )
    }));
  },
  
  deleteWork: (id) => {
    set((state) => ({ works: state.works.filter((work) => work.id !== id) }));
  },
  
  getWorksByStatus: (status) => {
    return get().works.filter((work) => work.status === status);
  },
  
  getWorksByType: (type) => {
    return get().works.filter((work) => work.type === type);
  },
  
  getWorksByObject: (objectId) => {
    return get().works.filter((work) => work.objectId === objectId);
  },
  
  getStatistics: () => {
    const works = get().works;
    const planned = works.filter((w) => w.status === 'planned').length;
    const inProgress = works.filter((w) => w.status === 'in_progress').length;
    const completed = works.filter((w) => w.status === 'completed').length;
    const overdue = works.filter((w) => w.status === 'overdue').length;
    const total = works.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      planned,
      inProgress,
      completed,
      overdue,
      completionRate
    };
  }
  
}), { name: 'maintenance-storage-v1' }));