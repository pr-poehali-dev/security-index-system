import type { AttestationOrder, OrderEmployee } from '../attestationOrdersStore';

export const mockAttestationOrders: AttestationOrder[] = [
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
];

export const mockOrderEmployees: OrderEmployee[] = [
  {
    id: 'oe-1',
    orderId: 'order-1',
    personnelId: 'personnel-1',
    organizationName: 'ООО "Энергопром"',
    fullName: 'Иванов Иван Иванович',
    position: 'Инженер по охране труда',
    attestationArea: 'А.1 Основы промышленной безопасности',
    certificateNumber: 'ДПО-2023-001',
    certificateDate: '2023-06-15'
  },
  {
    id: 'oe-2',
    orderId: 'order-1',
    personnelId: 'personnel-2',
    organizationName: 'ООО "Энергопром"',
    fullName: 'Петрова Анна Сергеевна',
    position: 'Начальник отдела',
    attestationArea: 'Б.3 Эксплуатация объектов электроэнергетики',
    certificateNumber: 'ДПО-2023-045',
    certificateDate: '2023-08-20'
  },
  {
    id: 'oe-3',
    orderId: 'order-2',
    personnelId: 'personnel-3',
    organizationName: 'ООО "Энергопром"',
    fullName: 'Сидоров Константин Петрович',
    position: 'Мастер участка',
    attestationArea: 'А.1 Основы промышленной безопасности',
    certificateNumber: 'ДПО-2023-078',
    certificateDate: '2023-09-10'
  }
];
