// src/stores/ordersStore.ts
// Описание: Zustand store для управления приказами на аттестацию
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderCertification {
  personnelId: string;
  certificationId: string;
  category: string;
  area: string;
}

export interface Order {
  id: string;
  tenantId: string;
  number: string;
  date: string;
  type: 'attestation' | 'training' | 'suspension' | 'lms' | 'internal';
  title: string;
  employeeIds: string[];
  certifications?: OrderCertification[];
  status: 'draft' | 'prepared' | 'approved' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  description?: string;
  documentUrl?: string;
  sentToTrainingCenter?: boolean;
  trainingCenterRequestId?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersState {
  orders: Order[];
  
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  sendOrderToTrainingCenter: (orderId: string, contractorId: string, requestType: 'full_training' | 'sdo_access_only') => string | null;
}

export const useOrdersStore = create<OrdersState>()(persist((set, get) => ({
  orders: [
    {
      id: 'order-1',
      tenantId: 'tenant-1',
      number: '№12-ПБ',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'attestation',
      title: 'О направлении на аттестацию по промышленной безопасности',
      employeeIds: ['personnel-1', 'personnel-2'],
      status: 'active',
      createdBy: 'Директор И.И. Петров',
      description: 'Направить сотрудников на аттестацию в АНО ДПО "Учебный центр"',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order-2',
      tenantId: 'tenant-1',
      number: '№08-ОТ',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'training',
      title: 'Об организации обучения по охране труда',
      employeeIds: ['personnel-1', 'personnel-3'],
      status: 'completed',
      createdBy: 'Специалист по ОТ А.С. Иванова',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order-3',
      tenantId: 'tenant-1',
      number: '№19-О',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'suspension',
      title: 'Об отстранении от работы',
      employeeIds: ['personnel-2'],
      status: 'active',
      createdBy: 'Директор И.И. Петров',
      description: 'В связи с истечением срока действия аттестации',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order-4',
      tenantId: 'tenant-1',
      number: '№23-УЦ',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'training',
      title: 'О подготовке в учебный центр',
      employeeIds: ['personnel-3', 'personnel-5', 'personnel-7'],
      status: 'approved',
      createdBy: 'Специалист по ОТ А.С. Иванова',
      description: 'Направить на подготовку по недостающим областям аттестации: Б.1 Эксплуатация опасных производственных объектов, Б.7 Эксплуатация химически опасных производственных объектов',
      sentToTrainingCenter: true,
      trainingCenterRequestId: 'req-training-1',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order-5',
      tenantId: 'tenant-1',
      number: '№24-УЦ',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'training',
      title: 'О подготовке в учебный центр',
      employeeIds: ['personnel-4', 'personnel-6'],
      status: 'approved',
      createdBy: 'Специалист по ОТ А.С. Иванова',
      description: 'Направить на подготовку по недостающим областям: Охрана труда для руководителей и специалистов',
      sentToTrainingCenter: true,
      trainingCenterRequestId: 'req-training-2',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order-6',
      tenantId: 'tenant-1',
      number: '№25-СДО',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'lms',
      title: 'О подготовке в СДО Интеллектуальная система',
      employeeIds: ['personnel-2', 'personnel-8', 'personnel-9'],
      status: 'approved',
      createdBy: 'Специалист по ОТ А.С. Иванова',
      description: 'Направить на подготовку в системе дистанционного обучения по недостающим областям: А.1 Основы промышленной безопасности',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order-7',
      tenantId: 'tenant-1',
      number: '№26-СДО',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'lms',
      title: 'О подготовке в СДО Интеллектуальная система',
      employeeIds: ['personnel-10'],
      status: 'approved',
      createdBy: 'Специалист по ОТ А.С. Иванова',
      description: 'Направить на подготовку в СДО по недостающим областям: Б.2 Эксплуатация систем газораспределения и газопотребления',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  addOrder: (order) => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ orders: [...state.orders, newOrder] }));
  },

  updateOrder: (id, updates) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, ...updates, updatedAt: new Date().toISOString() } : order
      )
    }));
  },

  deleteOrder: (id) => {
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id)
    }));
  },

  sendOrderToTrainingCenter: (orderId, contractorId, requestType) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return null;

    const { useSettingsStore } = require('./settingsStore');
    const { useTrainingCenterStore } = require('./trainingCenterStore');
    const { useAuthStore } = require('./authStore');
    
    const contractor = useSettingsStore.getState().contractors.find(c => c.id === contractorId);
    const user = useAuthStore.getState().user;
    const personnel = useSettingsStore.getState().personnel.filter(p => order.employeeIds.includes(p.id));
    const people = useSettingsStore.getState().people;
    const positions = useSettingsStore.getState().positions;
    const organizations = useSettingsStore.getState().organizations;

    if (!contractor || !contractor.contractorTenantId || !user) return null;

    const org = organizations.find(o => o.id === personnel[0]?.organizationId);

    const students = personnel.map(p => {
      const person = people.find(per => per.id === p.personId);
      const position = positions.find(pos => pos.id === p.positionId);
      return {
        personnelId: p.id,
        fullName: person ? `${person.lastName} ${person.firstName} ${person.middleName || ''}`.trim() : 'Неизвестно',
        position: position?.name || 'Не указана',
        department: undefined
      };
    });

    const request: any = {
      id: `req-${Date.now()}`,
      tenantId: contractor.contractorTenantId,
      fromTenantId: user.tenantId,
      fromTenantName: org?.name || 'Организация',
      organizationId: org?.id || '',
      organizationName: org?.name || 'Организация',
      programId: 'program-generic',
      programName: order.title,
      requestDate: new Date().toISOString(),
      requestType,
      studentsCount: students.length,
      students,
      contactPerson: user.name,
      contactEmail: user.email,
      preferredStartDate: undefined,
      status: 'new' as const,
      notes: order.description,
      orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    useTrainingCenterStore.getState().addRequest(request);
    
    get().updateOrder(orderId, {
      sentToTrainingCenter: true,
      trainingCenterRequestId: request.id,
      status: 'active'
    });

    return request.id;
  }
}), {
  name: 'orders-storage'
}));