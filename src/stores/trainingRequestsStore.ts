// src/stores/trainingRequestsStore.ts
// Описание: Zustand store для управления заявками на обучение
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TrainingRequest } from '@/types/attestation';

interface TrainingRequestsState {
  requests: TrainingRequest[];
  
  addRequest: (request: Omit<TrainingRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRequest: (id: string, updates: Partial<TrainingRequest>) => void;
  deleteRequest: (id: string) => void;
  getRequestsByTenant: (tenantId: string) => TrainingRequest[];
  getRequestsByEmployee: (employeeId: string) => TrainingRequest[];
  getPendingRequests: (tenantId: string) => TrainingRequest[];
  autoCreateRequest: (employeeId: string, employeeName: string, position: string, organizationName: string, expiryDate: string, tenantId: string) => void;
}

export const useTrainingRequestsStore = create<TrainingRequestsState>()(persist((set, get) => ({
  requests: [
    {
      id: 'req-1',
      tenantId: 'tenant-1',
      employeeId: 'personnel-2',
      employeeName: 'Петров Иван Сергеевич',
      position: 'Главный энергетик',
      organizationName: 'ГЭС-1',
      programName: 'Повышение квалификации энергетиков',
      reason: 'expiring_qualification',
      priority: 'high',
      expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      requestDate: new Date().toISOString(),
      status: 'pending',
      autoCreated: true,
      notes: 'Автоматически создана заявка: удостоверение ПК истекает через 25 дней',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'req-2',
      tenantId: 'tenant-1',
      employeeId: 'personnel-5',
      employeeName: 'Смирнова Ольга Петровна',
      position: 'Инженер по охране труда',
      organizationName: 'ГЭС-1',
      programName: 'Охрана труда при работе на высоте',
      reason: 'mandatory',
      priority: 'high',
      requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'approved',
      approvedBy: 'Директор по персоналу',
      approvedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      autoCreated: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'req-3',
      tenantId: 'tenant-1',
      employeeId: 'personnel-8',
      employeeName: 'Кузнецов Дмитрий Александрович',
      position: 'Мастер смены',
      organizationName: 'ГЭС-2',
      programName: 'Управление персоналом и охрана труда',
      reason: 'new_position',
      priority: 'medium',
      requestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'in_progress',
      approvedBy: 'Директор по производству',
      approvedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      autoCreated: false,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  addRequest: (request) => {
    const newRequest: TrainingRequest = {
      ...request,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ requests: [...state.requests, newRequest] }));
  },
  
  updateRequest: (id, updates) => {
    set((state) => ({
      requests: state.requests.map((request) =>
        request.id === id ? { ...request, ...updates, updatedAt: new Date().toISOString() } : request
      )
    }));
  },
  
  deleteRequest: (id) => {
    set((state) => ({
      requests: state.requests.filter((request) => request.id !== id)
    }));
  },
  
  getRequestsByTenant: (tenantId) => {
    return get().requests.filter((request) => request.tenantId === tenantId);
  },
  
  getRequestsByEmployee: (employeeId) => {
    return get().requests.filter((request) => request.employeeId === employeeId);
  },
  
  getPendingRequests: (tenantId) => {
    return get().requests.filter((request) => 
      request.tenantId === tenantId && request.status === 'pending'
    );
  },
  
  autoCreateRequest: (employeeId, employeeName, position, organizationName, expiryDate, tenantId) => {
    const existingRequest = get().requests.find(
      (req) => req.employeeId === employeeId && 
      req.reason === 'expiring_qualification' && 
      req.status === 'pending'
    );
    
    if (!existingRequest) {
      const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      get().addRequest({
        tenantId,
        employeeId,
        employeeName,
        position,
        organizationName,
        programName: 'Повышение квалификации',
        reason: 'expiring_qualification',
        priority: daysUntilExpiry <= 30 ? 'high' : 'medium',
        expiryDate,
        requestDate: new Date().toISOString(),
        status: 'pending',
        autoCreated: true,
        notes: `Автоматически создана заявка: удостоверение ПК истекает через ${daysUntilExpiry} дней`
      });
    }
  }
}), {
  name: 'training-requests-storage'
}));
