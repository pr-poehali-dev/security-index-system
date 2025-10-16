// src/stores/trainingCentersStore.ts
// Описание: Zustand store для управления подключениями к учебным центрам (тенантам)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TrainingCenterConnection, TrainingCenterRequest } from '@/types/attestation';

interface TrainingCentersState {
  connections: TrainingCenterConnection[];
  centerRequests: TrainingCenterRequest[];
  
  addConnection: (connection: Omit<TrainingCenterConnection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateConnection: (id: string, updates: Partial<TrainingCenterConnection>) => void;
  deleteConnection: (id: string) => void;
  getConnectionsByTenant: (tenantId: string) => TrainingCenterConnection[];
  getActiveConnections: (tenantId: string) => TrainingCenterConnection[];
  
  addCenterRequest: (request: Omit<TrainingCenterRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCenterRequest: (id: string, updates: Partial<TrainingCenterRequest>) => void;
  getCenterRequestsByTenant: (tenantId: string) => TrainingCenterRequest[];
  getCenterRequestsByTrainingRequest: (trainingRequestId: string) => TrainingCenterRequest[];
  getCenterRequestsByTrainingCenter: (trainingCenterTenantId: string) => TrainingCenterRequest[];
}

export const useTrainingCentersStore = create<TrainingCentersState>()(persist((set, get) => ({
  connections: [
    {
      id: 'conn-1',
      tenantId: 'tenant-1',
      trainingCenterTenantId: 'tenant-uc-energia',
      trainingCenterName: 'Учебный центр "Энергия"',
      specializations: ['Энергетика', 'Охрана труда', 'Промышленная безопасность'],
      isActive: true,
      autoSendRequests: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'conn-2',
      tenantId: 'tenant-1',
      trainingCenterTenantId: 'tenant-uc-prombez',
      trainingCenterName: 'АНО ДПО "Промбезопасность"',
      specializations: ['Промышленная безопасность', 'Охрана труда', 'Экология'],
      isActive: true,
      autoSendRequests: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'conn-3',
      tenantId: 'tenant-1',
      trainingCenterTenantId: 'tenant-uc-technadzor',
      trainingCenterName: 'Центр повышения квалификации "Технадзор"',
      specializations: ['Технический надзор', 'Строительство', 'ГО и ЧС'],
      isActive: true,
      autoSendRequests: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  centerRequests: [
    {
      id: 'tcr-1',
      tenantId: 'tenant-1',
      trainingCenterTenantId: 'tenant-uc-energia',
      trainingCenterName: 'Учебный центр "Энергия"',
      trainingRequestId: 'req-1',
      employeeId: 'personnel-2',
      employeeName: 'Петров Иван Сергеевич',
      position: 'Главный энергетик',
      organizationName: 'ГЭС-1',
      programName: 'Повышение квалификации энергетиков',
      sendDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'received',
      responseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      responseMessage: 'Заявка принята. Ожидается начало обучения.',
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
      trainingCenterTenantId: 'tenant-uc-prombez',
      trainingCenterName: 'АНО ДПО "Промбезопасность"',
      trainingRequestId: 'req-2',
      employeeId: 'personnel-5',
      employeeName: 'Смирнова Ольга Петровна',
      position: 'Инженер по охране труда',
      organizationName: 'ГЭС-1',
      programName: 'Охрана труда при работе на высоте',
      sendDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'sent',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  addConnection: (connection) => {
    const newConnection: TrainingCenterConnection = {
      ...connection,
      id: `conn-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ connections: [...state.connections, newConnection] }));
  },
  
  updateConnection: (id, updates) => {
    set((state) => ({
      connections: state.connections.map((conn) =>
        conn.id === id ? { ...conn, ...updates, updatedAt: new Date().toISOString() } : conn
      )
    }));
  },
  
  deleteConnection: (id) => {
    set((state) => ({
      connections: state.connections.filter((conn) => conn.id !== id)
    }));
  },
  
  getConnectionsByTenant: (tenantId) => {
    return get().connections.filter((conn) => conn.tenantId === tenantId);
  },
  
  getActiveConnections: (tenantId) => {
    return get().connections.filter((conn) => conn.tenantId === tenantId && conn.isActive);
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
  },
  
  getCenterRequestsByTrainingCenter: (trainingCenterTenantId) => {
    return get().centerRequests.filter((request) => request.trainingCenterTenantId === trainingCenterTenantId);
  }
}), {
  name: 'training-centers-storage'
}));
