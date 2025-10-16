// src/stores/trainingCentersStore.ts
// Описание: Zustand store для управления учебными центрами и интеграциями
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TrainingCenter, TrainingCenterRequest } from '@/types/attestation';

interface TrainingCentersState {
  centers: TrainingCenter[];
  centerRequests: TrainingCenterRequest[];
  
  addCenter: (center: Omit<TrainingCenter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCenter: (id: string, updates: Partial<TrainingCenter>) => void;
  deleteCenter: (id: string) => void;
  getCentersByTenant: (tenantId: string) => TrainingCenter[];
  getActiveCenters: (tenantId: string) => TrainingCenter[];
  
  addCenterRequest: (request: Omit<TrainingCenterRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCenterRequest: (id: string, updates: Partial<TrainingCenterRequest>) => void;
  getCenterRequestsByTenant: (tenantId: string) => TrainingCenterRequest[];
  getCenterRequestsByTrainingRequest: (trainingRequestId: string) => TrainingCenterRequest[];
}

export const useTrainingCentersStore = create<TrainingCentersState>()(persist((set, get) => ({
  centers: [
    {
      id: 'tc-1',
      tenantId: 'tenant-1',
      name: 'Учебный центр "Энергия"',
      legalName: 'ООО "Учебный центр Энергия"',
      inn: '7701234567',
      contactPerson: 'Соколова Елена Викторовна',
      email: 'info@energia-uc.ru',
      phone: '+7 495 123-45-67',
      address: 'г. Москва, ул. Энергетическая, д. 15',
      website: 'https://energia-uc.ru',
      specializations: ['Энергетика', 'Охрана труда', 'Промышленная безопасность'],
      isActive: true,
      autoSendRequests: true,
      apiEnabled: true,
      apiEndpoint: 'https://api.energia-uc.ru/training-requests',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tc-2',
      tenantId: 'tenant-1',
      name: 'АНО ДПО "Промбезопасность"',
      legalName: 'Автономная некоммерческая организация дополнительного профессионального образования "Промбезопасность"',
      inn: '7702987654',
      contactPerson: 'Иванов Сергей Петрович',
      email: 'training@prombez.ru',
      phone: '+7 495 987-65-43',
      address: 'г. Москва, пр-т Промышленный, д. 28',
      website: 'https://prombez.ru',
      specializations: ['Промышленная безопасность', 'Охрана труда', 'Экология'],
      isActive: true,
      autoSendRequests: false,
      apiEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tc-3',
      tenantId: 'tenant-1',
      name: 'Центр повышения квалификации "Технадзор"',
      contactPerson: 'Петрова Ольга Михайловна',
      email: 'education@technadzor.ru',
      phone: '+7 495 555-77-88',
      specializations: ['Технический надзор', 'Строительство', 'ГО и ЧС'],
      isActive: true,
      autoSendRequests: true,
      apiEnabled: true,
      apiEndpoint: 'https://api.technadzor.ru/v1/requests',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  centerRequests: [
    {
      id: 'tcr-1',
      tenantId: 'tenant-1',
      trainingCenterId: 'tc-1',
      trainingCenterName: 'Учебный центр "Энергия"',
      trainingRequestId: 'req-1',
      employeeName: 'Петров Иван Сергеевич',
      programName: 'Повышение квалификации энергетиков',
      sendDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'confirmed',
      responseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      responseMessage: 'Заявка принята. Обучение запланировано.',
      scheduledStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      scheduledEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      cost: 35000,
      confirmationNumber: 'EN-2025-0147',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'tcr-2',
      tenantId: 'tenant-1',
      trainingCenterId: 'tc-2',
      trainingCenterName: 'АНО ДПО "Промбезопасность"',
      trainingRequestId: 'req-2',
      employeeName: 'Смирнова Ольга Петровна',
      programName: 'Охрана труда при работе на высоте',
      sendDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'sent',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  addCenter: (center) => {
    const newCenter: TrainingCenter = {
      ...center,
      id: `tc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ centers: [...state.centers, newCenter] }));
  },
  
  updateCenter: (id, updates) => {
    set((state) => ({
      centers: state.centers.map((center) =>
        center.id === id ? { ...center, ...updates, updatedAt: new Date().toISOString() } : center
      )
    }));
  },
  
  deleteCenter: (id) => {
    set((state) => ({
      centers: state.centers.filter((center) => center.id !== id)
    }));
  },
  
  getCentersByTenant: (tenantId) => {
    return get().centers.filter((center) => center.tenantId === tenantId);
  },
  
  getActiveCenters: (tenantId) => {
    return get().centers.filter((center) => center.tenantId === tenantId && center.isActive);
  },
  
  addCenterRequest: (request) => {
    const newRequest: TrainingCenterRequest = {
      ...request,
      id: `tcr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ centerRequests: [...state.centerRequests, newRequest] }));
  },
  
  updateCenterRequest: (id, updates) => {
    set((state) => ({
      centerRequests: state.centerRequests.map((request) =>
        request.id === id ? { ...request, ...updates, updatedAt: new Date().toISOString() } : request
      )
    }));
  },
  
  getCenterRequestsByTenant: (tenantId) => {
    return get().centerRequests.filter((request) => request.tenantId === tenantId);
  },
  
  getCenterRequestsByTrainingRequest: (trainingRequestId) => {
    return get().centerRequests.filter((request) => request.trainingRequestId === trainingRequestId);
  }
}), {
  name: 'training-centers-storage'
}));
