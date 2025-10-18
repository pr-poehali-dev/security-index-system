import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AttestationOrder {
  id: string;
  tenantId: string;
  number: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  attestationType: 'rostechnadzor' | 'company_commission';
  employeeIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEmployee {
  id: string;
  orderId: string;
  personnelId: string;
  organizationName: string;
  fullName: string;
  position: string;
  attestationArea: string;
  dpoQualificationId?: string;
  certificateNumber: string;
  certificateDate: string;
}

interface AttestationOrdersState {
  orders: AttestationOrder[];
  orderEmployees: OrderEmployee[];
  
  addOrder: (order: Omit<AttestationOrder, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateOrder: (id: string, updates: Partial<AttestationOrder>) => void;
  deleteOrder: (id: string) => void;
  getOrdersByTenant: (tenantId: string) => AttestationOrder[];
  
  addOrderEmployee: (employee: Omit<OrderEmployee, 'id'>) => void;
  removeOrderEmployee: (id: string) => void;
  getOrderEmployees: (orderId: string) => OrderEmployee[];
  updateOrderEmployee: (id: string, updates: Partial<OrderEmployee>) => void;
}

export const useAttestationOrdersStore = create<AttestationOrdersState>()(persist((set, get) => ({
  orders: [
    {
      id: 'order-1',
      tenantId: 'tenant-1',
      number: 'ПА-015-2024',
      date: '2024-03-10',
      status: 'active',
      attestationType: 'rostechnadzor',
      employeeIds: ['personnel-1', 'personnel-2'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'order-2',
      tenantId: 'tenant-1',
      number: 'ПА-014-2024',
      date: '2024-02-28',
      status: 'completed',
      attestationType: 'company_commission',
      employeeIds: ['personnel-3'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  orderEmployees: [
    {
      id: 'oe-1',
      orderId: 'order-1',
      personnelId: 'personnel-1',
      organizationName: 'ГЭС-1',
      fullName: 'Иванов Иван Иванович',
      position: 'Начальник смены',
      attestationArea: 'А.1 Основы промышленной безопасности',
      certificateNumber: 'ДПО-2023-001',
      certificateDate: '2023-06-15'
    },
    {
      id: 'oe-2',
      orderId: 'order-1',
      personnelId: 'personnel-2',
      organizationName: 'ГЭС-1',
      fullName: 'Петров Иван Сергеевич',
      position: 'Главный энергетик',
      attestationArea: 'Б.3 Эксплуатация объектов электроэнергетики',
      certificateNumber: 'ДПО-2023-045',
      certificateDate: '2023-08-20'
    }
  ],

  addOrder: (order) => {
    const newOrder: AttestationOrder = {
      ...order,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ orders: [...state.orders, newOrder] }));
    return newOrder.id;
  },

  updateOrder: (id, updates) => {
    set((state) => ({
      orders: state.orders.map(order =>
        order.id === id 
          ? { ...order, ...updates, updatedAt: new Date().toISOString() }
          : order
      )
    }));
  },

  deleteOrder: (id) => {
    set((state) => ({
      orders: state.orders.filter(order => order.id !== id),
      orderEmployees: state.orderEmployees.filter(emp => emp.orderId !== id)
    }));
  },

  getOrdersByTenant: (tenantId) => {
    return get().orders.filter(order => order.tenantId === tenantId);
  },

  addOrderEmployee: (employee) => {
    const newEmployee: OrderEmployee = {
      ...employee,
      id: `oe-${Date.now()}-${Math.random()}`
    };
    set((state) => ({ orderEmployees: [...state.orderEmployees, newEmployee] }));
  },

  removeOrderEmployee: (id) => {
    set((state) => ({
      orderEmployees: state.orderEmployees.filter(emp => emp.id !== id)
    }));
  },

  getOrderEmployees: (orderId) => {
    return get().orderEmployees.filter(emp => emp.orderId === orderId);
  },

  updateOrderEmployee: (id, updates) => {
    set((state) => ({
      orderEmployees: state.orderEmployees.map(emp =>
        emp.id === id ? { ...emp, ...updates } : emp
      )
    }));
  }
}), {
  name: 'attestation-orders-storage'
}));
