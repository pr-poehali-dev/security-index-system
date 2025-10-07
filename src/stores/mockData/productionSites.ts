import type { ProductionSite } from '@/types';

export const mockProductionSites: ProductionSite[] = [
  {
    id: 'site-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    name: 'Производственная площадка №1',
    address: 'г. Москва, Промышленная зона, участок 10',
    code: 'PP-001',
    head: 'Сидоров К.П.',
    phone: '+7 (495) 123-45-67',
    status: 'active',
    createdAt: new Date(Date.now() - 600 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'site-2',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    name: 'Цех №5',
    address: 'г. Москва, ул. Заводская, д. 15',
    code: 'CEKH-005',
    head: 'Морозова Е.П.',
    phone: '+7 (495) 234-56-78',
    status: 'active',
    createdAt: new Date(Date.now() - 580 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'site-3',
    tenantId: 'tenant-1',
    organizationId: 'org-2',
    name: 'Ремонтная база',
    address: 'г. Москва, пр-т Энергетиков, д. 30',
    code: 'RB-001',
    head: 'Кузнецов А.В.',
    phone: '+7 (495) 345-67-89',
    status: 'active',
    createdAt: new Date(Date.now() - 550 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'site-4',
    tenantId: 'tenant-1',
    organizationId: 'org-3',
    name: 'Строительная площадка "Север"',
    address: 'г. Москва, Северный административный округ, участок 25',
    code: 'SP-SEVER',
    head: 'Волков С.П.',
    phone: '+7 (495) 456-78-90',
    status: 'active',
    createdAt: new Date(Date.now() - 520 * 24 * 60 * 60 * 1000).toISOString()
  }
];
