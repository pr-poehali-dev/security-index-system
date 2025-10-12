// src/stores/ordersStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Order {
  id: string;
  tenantId: string;
  number: string;
  date: string;
  type: 'attestation' | 'training' | 'suspension' | 'lms' | 'internal';
  title: string;
  employeeIds: string[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  description?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersState {
  orders: Order[];
  
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  getOrdersByTenant: (tenantId: string) => Order[];
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

  getOrdersByTenant: (tenantId) => {
    return get().orders.filter((order) => order.tenantId === tenantId);
  }
}), {
  name: 'orders-storage'
}));