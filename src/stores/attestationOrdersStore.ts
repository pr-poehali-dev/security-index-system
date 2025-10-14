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
}

export const useAttestationOrdersStore = create<AttestationOrdersState>()(persist((set, get) => ({
  orders: [
    {
      id: 'att-order-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      orderNumber: 'ПАТ-001/2024',
      orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      attestationType: 'rostekhnadzor',
      certificationAreaCode: 'B.1.1',
      certificationAreaName: 'Эксплуатация опасных производственных объектов',
      personnel: [
        {
          personnelId: 'personnel-3',
          fullName: 'Сидоров Константин Петрович',
          position: 'Электромонтер',
          requiredDocuments: [
            {
              documentType: 'training_certificate',
              documentName: 'Удостоверение_УД-2024-12345.pdf',
              certificateId: 'cert-synced-b11-1',
              fileId: 'doc-b11-1-cert',
              fileUrl: '/files/certificates/cert-b11-12345.pdf',
              status: 'attached'
            },
            {
              documentType: 'other',
              documentName: 'Протокол_ПБ-456-2024.pdf',
              certificateId: 'cert-synced-b11-1',
              fileId: 'doc-b11-1-protocol',
              fileUrl: '/files/protocols/protocol-b11-456.pdf',
              status: 'attached'
            }
          ]
        },
        {
          personnelId: 'personnel-5',
          fullName: 'Смирнова Елена Николаевна',
          position: 'Монтажник',
          requiredDocuments: [
            {
              documentType: 'training_certificate',
              documentName: 'Удостоверение_УД-2024-12346.pdf',
              certificateId: 'cert-synced-b11-2',
              fileId: 'doc-b11-2-cert',
              fileUrl: '/files/certificates/cert-b11-12346.pdf',
              status: 'attached'
            },
            {
              documentType: 'other',
              documentName: 'Протокол_ПБ-456-2024.pdf',
              certificateId: 'cert-synced-b11-2',
              fileId: 'doc-b11-2-protocol',
              fileUrl: '/files/protocols/protocol-b11-456.pdf',
              status: 'attached'
            }
          ]
        },
        {
          personnelId: 'personnel-7',
          fullName: 'Федорова Татьяна Владимировна',
          position: 'Инженер по газоснабжению',
          requiredDocuments: [
            {
              documentType: 'training_certificate',
              documentName: 'Удостоверение_УД-2024-12347.pdf',
              certificateId: 'cert-synced-b11-3',
              fileId: 'doc-b11-3-cert',
              fileUrl: '/files/certificates/cert-b11-12347.pdf',
              status: 'attached'
            },
            {
              documentType: 'other',
              documentName: 'Протокол_ПБ-456-2024.pdf',
              certificateId: 'cert-synced-b11-3',
              fileId: 'doc-b11-3-protocol',
              fileUrl: '/files/protocols/protocol-b11-456.pdf',
              status: 'attached'
            }
          ]
        }
      ],
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: 'Территориальное управление Ростехнадзора по г. Москва',
      status: 'draft',
      notes: 'Приказ создан автоматически после получения удостоверений из УЦ Профессионал',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
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
  

}), { name: 'attestation-orders-storage' }));