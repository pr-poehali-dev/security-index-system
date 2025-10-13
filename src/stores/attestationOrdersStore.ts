// src/stores/attestationOrdersStore.ts
// Описание: Zustand store для управления приказами на аттестацию
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttestationOrder, AttestationOrderPersonnel, AttestationOrderType, AttestationOrderStatus } from '@/types';

interface AttestationOrdersState {
  orders: AttestationOrder[];
  
  addOrder: (order: Omit<AttestationOrder, 'id' | 'createdAt' | 'updatedAt'>) => AttestationOrder;
  updateOrder: (id: string, updates: Partial<AttestationOrder>) => void;
  deleteOrder: (id: string) => void;
  getOrdersByTenant: (tenantId: string) => AttestationOrder[];
  getOrdersByOrganization: (organizationId: string) => AttestationOrder[];
  getOrdersByStatus: (status: AttestationOrderStatus) => AttestationOrder[];
}

export const useAttestationOrdersStore = create<AttestationOrdersState>()(persist((set, get) => ({
  orders: [],
  
  addOrder: (order) => {
    const newOrder: AttestationOrder = {
      ...order,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set((state) => ({
      orders: [...state.orders, newOrder]
    }));
    
    return newOrder;
  },
  
  updateOrder: (id, updates) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id 
          ? { ...order, ...updates, updatedAt: new Date().toISOString() }
          : order
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
  },
  
  getOrdersByOrganization: (organizationId) => {
    return get().orders.filter((order) => order.organizationId === organizationId);
  },
  
  getOrdersByStatus: (status) => {
    return get().orders.filter((order) => order.status === status);
  }
}), { name: 'attestation-orders-storage' }));
