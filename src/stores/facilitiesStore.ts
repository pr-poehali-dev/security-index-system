import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Facility, FacilityComponent, Organization, TerritorialAuthority } from '@/types/facilities';

interface FacilitiesState {
  organizations: Organization[];
  facilities: Facility[];
  components: FacilityComponent[];
  territorialAuthorities: TerritorialAuthority[];
  
  addOrganization: (org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  getOrganizationsByTenant: (tenantId: string) => Organization[];
  
  addFacility: (facility: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFacility: (id: string, updates: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;
  getFacilitiesByTenant: (tenantId: string) => Facility[];
  getFacilitiesByOrganization: (organizationId: string) => Facility[];
  
  addComponent: (component: Omit<FacilityComponent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComponent: (id: string, updates: Partial<FacilityComponent>) => void;
  deleteComponent: (id: string) => void;
  getComponentsByFacility: (facilityId: string) => FacilityComponent[];
  getComponentsByTenant: (tenantId: string) => FacilityComponent[];
  
  getTerritorialAuthorities: () => TerritorialAuthority[];
}

const mockTerritorialAuthorities: TerritorialAuthority[] = [
  {
    id: '1',
    fullName: 'Управление Ростехнадзора по Московской области',
    shortName: 'УРТ по МО',
    code: 'RTN-77',
    region: 'Московская область',
    address: 'г. Москва, ул. Примерная, д. 1',
    phone: '+7 (495) 123-45-67',
    email: 'moscow@gosnadzor.ru'
  },
  {
    id: '2',
    fullName: 'Управление Ростехнадзора по Санкт-Петербургу',
    shortName: 'УРТ по СПб',
    code: 'RTN-78',
    region: 'Санкт-Петербург',
    address: 'г. Санкт-Петербург, Невский пр., д. 100',
    phone: '+7 (812) 987-65-43',
    email: 'spb@gosnadzor.ru'
  }
];

const demoOrganizations: Organization[] = [
  {
    id: 'org-1',
    tenantId: 'tenant-1',
    name: 'ООО "Газпром нефть"',
    inn: '7736050003',
    kpp: '773601001',
    address: 'г. Москва, ул. Почтовая, д. 26, стр. 1',
    legalAddress: 'г. Москва, ул. Почтовая, д. 26, стр. 1',
    headFullName: 'Дьяков Александр Владимирович',
    headPosition: 'Генеральный директор',
    contactPhone: '+7 (495) 123-45-67',
    contactEmail: 'info@gazprom-neft.ru',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'org-2',
    tenantId: 'tenant-1',
    name: 'ПАО "Лукойл"',
    inn: '7708004767',
    kpp: '770801001',
    address: 'г. Москва, Сретенский бульвар, д. 11',
    legalAddress: 'г. Москва, Сретенский бульвар, д. 11',
    headFullName: 'Федоров Вадим Львович',
    headPosition: 'Президент',
    contactPhone: '+7 (495) 627-44-44',
    contactEmail: 'contact@lukoil.com',
    status: 'active',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  }
];

const demoFacilities: Facility[] = [
  {
    id: 'fac-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    type: 'opo',
    registrationNumber: 'A01-12345-2024',
    name: 'Компрессорная станция "Северная"',
    address: 'Московская область, г. Домодедово, ул. Промышленная, д. 15',
    territorialAuthorityId: '1',
    responsiblePersonId: 'pers-1',
    commissioningDate: '2020-05-15',
    status: 'active',
    hazardClass: 1,
    activityType: 'Транспортировка газа под давлением',
    dangerousSubstances: ['Природный газ', 'Метан'],
    maxPressure: 75.0,
    maxTemperature: 40.0,
    personnelCount: 24,
    description: 'Компрессорная станция для транспортировки природного газа',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'fac-2',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    type: 'gts',
    registrationNumber: 'G02-54321-2023',
    name: 'Магистральный газопровод "Восток"',
    address: 'Московская область, участок от г. Мытищи до г. Ногинск',
    territorialAuthorityId: '1',
    responsiblePersonId: 'pers-2',
    commissioningDate: '2018-11-20',
    status: 'active',
    pipelineDiameter: 1420,
    pipelineLength: 87.5,
    designPressure: 75.0,
    transportedSubstance: 'Природный газ',
    throughputCapacity: 32000000000,
    description: 'Участок магистрального газопровода высокого давления',
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-02-05T10:00:00Z',
  },
  {
    id: 'fac-3',
    tenantId: 'tenant-1',
    organizationId: 'org-2',
    type: 'opo',
    registrationNumber: 'A03-98765-2023',
    name: 'Нефтеперерабатывающий завод',
    address: 'г. Москва, Капотня, промзона',
    territorialAuthorityId: '1',
    responsiblePersonId: 'pers-3',
    commissioningDate: '2015-03-10',
    status: 'active',
    hazardClass: 1,
    activityType: 'Переработка нефти и нефтепродуктов',
    dangerousSubstances: ['Нефть', 'Бензин', 'Дизельное топливо'],
    maxPressure: 16.0,
    maxTemperature: 350.0,
    personnelCount: 156,
    description: 'Завод по переработке нефти мощностью 12 млн тонн в год',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  }
];

const demoComponents: FacilityComponent[] = [
  {
    id: 'comp-1',
    tenantId: 'tenant-1',
    facilityId: 'fac-1',
    type: 'building',
    name: 'Операторная',
    inventoryNumber: 'ЗД-001',
    commissioningDate: '2020-05-15',
    technicalCondition: 'good',
    nextInspectionDate: '2025-05-15',
    purpose: 'Помещение для операторов компрессорной станции',
    area: 120.5,
    floors: 2,
    constructionType: 'Кирпичное',
    status: 'active',
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-01T11:00:00Z',
  },
  {
    id: 'comp-2',
    tenantId: 'tenant-1',
    facilityId: 'fac-1',
    type: 'equipment',
    name: 'Центробежный компрессор ГПА-Ц-16',
    inventoryNumber: 'ОБ-КС-001',
    manufacturer: 'ОАО "Сумское НПО"',
    model: 'ГПА-Ц-16',
    serialNumber: 'К-2024-0456',
    commissioningDate: '2020-06-01',
    technicalCondition: 'good',
    nextInspectionDate: '2025-06-01',
    power: 16000,
    productivity: 285000,
    operatingPressure: 75.0,
    status: 'active',
    createdAt: '2024-02-01T11:30:00Z',
    updatedAt: '2024-02-01T11:30:00Z',
  },
  {
    id: 'comp-3',
    tenantId: 'tenant-1',
    facilityId: 'fac-2',
    type: 'pipeline',
    name: 'Участок газопровода км 0-25',
    inventoryNumber: 'ГП-В-001',
    commissioningDate: '2018-11-20',
    technicalCondition: 'satisfactory',
    nextInspectionDate: '2025-11-20',
    diameter: 1420,
    length: 25000,
    wallThickness: 18.7,
    material: 'Сталь 17Г1С',
    insulationType: 'Полиэтиленовое покрытие усиленного типа',
    status: 'active',
    createdAt: '2024-02-05T11:00:00Z',
    updatedAt: '2024-02-05T11:00:00Z',
  },
  {
    id: 'comp-4',
    tenantId: 'tenant-1',
    facilityId: 'fac-2',
    type: 'equipment',
    name: 'Задвижка запорная DN1400 PN75',
    inventoryNumber: 'АРМ-001',
    manufacturer: 'ООО "ЗТА"',
    model: 'ЗКШ-1400-75',
    serialNumber: 'ЗКШ-2018-0892',
    commissioningDate: '2018-11-20',
    technicalCondition: 'good',
    nextInspectionDate: '2025-05-20',
    operatingPressure: 75.0,
    status: 'active',
    createdAt: '2024-02-05T11:30:00Z',
    updatedAt: '2024-02-05T11:30:00Z',
  },
  {
    id: 'comp-5',
    tenantId: 'tenant-1',
    facilityId: 'fac-3',
    type: 'equipment',
    name: 'Ректификационная колонна К-101',
    inventoryNumber: 'ТЕХ-РК-101',
    manufacturer: 'ООО "Нефтехиммаш"',
    model: 'РК-4500',
    serialNumber: 'РК-2015-0123',
    commissioningDate: '2015-03-10',
    technicalCondition: 'satisfactory',
    nextInspectionDate: '2025-03-10',
    operatingPressure: 2.5,
    operatingTemperature: 180,
    status: 'active',
    createdAt: '2024-02-10T11:00:00Z',
    updatedAt: '2024-02-10T11:00:00Z',
  }
];

export const useFacilitiesStore = create<FacilitiesState>()(
  persist(
    (set, get) => ({
      organizations: demoOrganizations,
      facilities: demoFacilities,
      components: demoComponents,
      territorialAuthorities: mockTerritorialAuthorities,
      
      addOrganization: (org) => {
        const newOrg: Organization = {
          ...org,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          organizations: [...state.organizations, newOrg],
        }));
      },
      
      updateOrganization: (id, updates) => {
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === id ? { ...org, ...updates, updatedAt: new Date().toISOString() } : org
          ),
        }));
      },
      
      deleteOrganization: (id) => {
        set((state) => ({
          organizations: state.organizations.filter((org) => org.id !== id),
        }));
      },
      
      getOrganizationsByTenant: (tenantId) => {
        return get().organizations.filter((org) => org.tenantId === tenantId);
      },
      
      addFacility: (facility) => {
        const newFacility: Facility = {
          ...facility,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          facilities: [...state.facilities, newFacility],
        }));
      },
      
      updateFacility: (id, updates) => {
        set((state) => ({
          facilities: state.facilities.map((facility) =>
            facility.id === id ? { ...facility, ...updates, updatedAt: new Date().toISOString() } : facility
          ),
        }));
      },
      
      deleteFacility: (id) => {
        set((state) => ({
          facilities: state.facilities.filter((facility) => facility.id !== id),
        }));
      },
      
      getFacilitiesByTenant: (tenantId) => {
        return get().facilities.filter((facility) => facility.tenantId === tenantId);
      },
      
      getFacilitiesByOrganization: (organizationId) => {
        return get().facilities.filter((facility) => facility.organizationId === organizationId);
      },
      
      addComponent: (component) => {
        const newComponent: FacilityComponent = {
          ...component,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          components: [...state.components, newComponent],
        }));
      },
      
      updateComponent: (id, updates) => {
        set((state) => ({
          components: state.components.map((component) =>
            component.id === id ? { ...component, ...updates, updatedAt: new Date().toISOString() } : component
          ),
        }));
      },
      
      deleteComponent: (id) => {
        set((state) => ({
          components: state.components.filter((component) => component.id !== id),
        }));
      },
      
      getComponentsByFacility: (facilityId) => {
        return get().components.filter((component) => component.facilityId === facilityId);
      },
      
      getComponentsByTenant: (tenantId) => {
        return get().components.filter((component) => component.tenantId === tenantId);
      },
      
      getTerritorialAuthorities: () => {
        return get().territorialAuthorities;
      },
    }),
    {
      name: 'facilities-storage',
    }
  )
);