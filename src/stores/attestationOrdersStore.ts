import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockAttestationOrders, mockOrderEmployees } from './mockData';

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
  orders: mockAttestationOrders,
  orderEmployees: mockOrderEmployees,

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