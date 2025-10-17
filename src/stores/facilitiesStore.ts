import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Facility, FacilityComponent, TerritorialAuthority } from '@/types/facilities';

interface FacilitiesState {
  facilities: Facility[];
  components: FacilityComponent[];
  territorialAuthorities: TerritorialAuthority[];
  
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

const demoFacilities: Facility[] = [
  {
    id: 'fac-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    organizationName: 'ООО "Газпром нефть"',
    type: 'opo',
    fullName: 'Компрессорная станция "Северная" цеха газоснабжения ООО "Газпром нефть"',
    typicalName: 'Компрессорная станция',
    registrationNumber: 'A01-12345-2024',
    industryCode: '51.22.1',
    address: 'Московская область, г. Домодедово, ул. Промышленная, д. 15',
    operatingOrganizationId: 'org-1',
    operatingOrganizationName: 'ООО "Газпром нефть"',
    responsiblePersonId: 'pers-1',
    responsiblePersonName: 'Иванов И.И.',
    hazardIdentifications: [
      { id: 'h1', category: 'Газ под давлением', description: 'Природный газ', quantity: '10000', unit: 'м³' }
    ],
    hazardClass: 'I',
    territorialAuthorityId: '1',
    territorialAuthorityName: 'УРТ по МО',
    documents: [],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'fac-2',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    organizationName: 'ООО "Газпром нефть"',
    type: 'gts',
    fullName: 'Плотина водохранилища "Химкинское" на реке Химка',
    typicalName: 'Плотина водохранилища',
    registrationNumber: 'ГТС-77-00245-2018',
    industryCode: '42.21',
    address: 'Московская область, г. Химки, река Химка, км 3.5',
    operatingOrganizationId: 'org-1',
    operatingOrganizationName: 'ООО "Газпром нефть"',
    responsiblePersonId: 'pers-2',
    responsiblePersonName: 'Петров П.П.',
    hazardIdentifications: [
      { id: 'h2', category: 'Гидротехническое сооружение', description: 'Напорный фронт 8.5 метров', quantity: '8.5', unit: 'м' }
    ],
    hazardClass: 'III',
    territorialAuthorityId: '1',
    territorialAuthorityName: 'УРТ по МО',
    documents: [],
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-02-05T10:00:00Z',
  },
  {
    id: 'fac-3',
    tenantId: 'tenant-1',
    organizationId: 'org-2',
    organizationName: 'ПАО "Лукойл"',
    type: 'opo',
    fullName: 'Нефтеперерабатывающий завод ПАО "Лукойл" в районе Капотня',
    typicalName: 'Нефтеперерабатывающий завод',
    registrationNumber: 'A03-98765-2023',
    industryCode: '19.20',
    address: 'г. Москва, Капотня, промзона',
    operatingOrganizationId: 'org-2',
    operatingOrganizationName: 'ПАО "Лукойл"',
    responsiblePersonId: 'pers-3',
    responsiblePersonName: 'Сидоров С.С.',
    hazardIdentifications: [
      { id: 'h3', category: 'Легковоспламеняющиеся вещества', description: 'Нефть и нефтепродукты', quantity: '50000', unit: 'тонн' }
    ],
    hazardClass: 'I',
    territorialAuthorityId: '1',
    territorialAuthorityName: 'УРТ по МО',
    documents: [],
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  }
];

const demoComponents: FacilityComponent[] = [
  {
    id: 'comp-1',
    tenantId: 'tenant-1',
    facilityId: 'fac-1',
    facilityName: 'Компрессорная станция "Северная"',
    type: 'building_structure',
    fullName: 'Здание операторной компрессорной станции "Северная"',
    shortName: 'Операторная',
    commissioningDate: '2020-05-15',
    technicalStatus: 'operating',
    equipmentStatus: 'working',
    registeredInRostechnadzor: false,
    internalRegistrationNumber: 'ЗД-001',
    customDocuments: [],
    expertiseRecords: [],
    maintenanceRecords: [],
    constructionData: [
      { id: 'cd1', parameter: 'Площадь', value: '120.5', unit: 'м²' },
      { id: 'cd2', parameter: 'Этажность', value: '2', unit: 'этажа' },
      { id: 'cd3', parameter: 'Тип конструкции', value: 'Кирпичное', unit: '' }
    ],
    technicalParameters: [],
    accidents: [],
    rostechnadzorDirectives: [],
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-01T11:00:00Z',
  },
  {
    id: 'comp-2',
    tenantId: 'tenant-1',
    facilityId: 'fac-1',
    facilityName: 'Компрессорная станция "Северная"',
    type: 'technical_device',
    fullName: 'Центробежный компрессор ГПА-Ц-16 заводской номер К-2024-0456',
    shortName: 'Компрессор ГПА-Ц-16',
    deviceType: 'Компрессор центробежный',
    brand: 'ГПА-Ц-16',
    manufacturer: 'ОАО "Сумское НПО"',
    factoryNumber: 'К-2024-0456',
    commissioningDate: '2020-06-01',
    technicalStatus: 'operating',
    equipmentStatus: 'working',
    registeredInRostechnadzor: true,
    internalRegistrationNumber: 'ОБ-КС-001',
    rostechnadzorRegistrationNumber: 'РТН-77-КС-00456',
    customDocuments: [],
    expertiseRecords: [],
    maintenanceRecords: [],
    constructionData: [],
    technicalParameters: [
      { id: 'tp1', parameter: 'Мощность', value: '16000', unit: 'кВт' },
      { id: 'tp2', parameter: 'Производительность', value: '285000', unit: 'м³/ч' },
      { id: 'tp3', parameter: 'Рабочее давление', value: '75.0', unit: 'атм' }
    ],
    accidents: [],
    rostechnadzorDirectives: [],
    createdAt: '2024-02-01T11:30:00Z',
    updatedAt: '2024-02-01T11:30:00Z',
  },
  {
    id: 'comp-3',
    tenantId: 'tenant-1',
    facilityId: 'fac-2',
    facilityName: 'Плотина водохранилища "Химкинское"',
    type: 'building_structure',
    fullName: 'Тело плотины водохранилища "Химкинское" на реке Химка',
    shortName: 'Тело плотины',
    commissioningDate: '2018-11-20',
    technicalStatus: 'operating',
    equipmentStatus: 'working',
    registeredInRostechnadzor: true,
    internalRegistrationNumber: 'ГТС-ПЛТ-001',
    rostechnadzorRegistrationNumber: 'РТН-77-ГТС-00245',
    customDocuments: [],
    expertiseRecords: [],
    maintenanceRecords: [],
    constructionData: [
      { id: 'cd4', parameter: 'Длина по гребню', value: '185', unit: 'м' },
      { id: 'cd5', parameter: 'Высота', value: '12.5', unit: 'м' },
      { id: 'cd6', parameter: 'Ширина по гребню', value: '6.0', unit: 'м' },
      { id: 'cd7', parameter: 'Материал', value: 'Бетон, грунтовая насыпь', unit: '' },
      { id: 'cd8', parameter: 'Напорный фронт', value: '8.5', unit: 'м' }
    ],
    technicalParameters: [],
    accidents: [],
    rostechnadzorDirectives: [],
    createdAt: '2024-02-05T11:00:00Z',
    updatedAt: '2024-02-05T11:00:00Z',
  },
  {
    id: 'comp-4',
    tenantId: 'tenant-1',
    facilityId: 'fac-2',
    facilityName: 'Плотина водохранилища "Химкинское"',
    type: 'technical_device',
    fullName: 'Затвор водосливной № 1 плотины водохранилища "Химкинское"',
    shortName: 'Затвор № 1',
    deviceType: 'Затвор водосливной сегментный',
    brand: 'ЗСП-4.5х3.2',
    manufacturer: 'ООО "Гидромашсервис"',
    factoryNumber: 'ГМС-2018-1245',
    commissioningDate: '2018-11-20',
    technicalStatus: 'operating',
    equipmentStatus: 'working',
    registeredInRostechnadzor: true,
    internalRegistrationNumber: 'ГТС-ЗТВ-001',
    rostechnadzorRegistrationNumber: 'РТН-77-ГТС-01245',
    customDocuments: [],
    expertiseRecords: [],
    maintenanceRecords: [],
    constructionData: [],
    technicalParameters: [
      { id: 'tp4', parameter: 'Пролёт', value: '4.5', unit: 'м' },
      { id: 'tp5', parameter: 'Высота', value: '3.2', unit: 'м' },
      { id: 'tp6', parameter: 'Пропускная способность', value: '45', unit: 'м³/с' }
    ],
    accidents: [],
    rostechnadzorDirectives: [],
    createdAt: '2024-02-05T11:30:00Z',
    updatedAt: '2024-02-05T11:30:00Z',
  },
  {
    id: 'comp-5',
    tenantId: 'tenant-1',
    facilityId: 'fac-3',
    facilityName: 'Нефтеперерабатывающий завод',
    type: 'technical_device',
    fullName: 'Ректификационная колонна К-101 заводской номер РК-2015-0123',
    shortName: 'Колонна К-101',
    deviceType: 'Ректификационная колонна',
    brand: 'РК-4500',
    manufacturer: 'ООО "Нефтехиммаш"',
    factoryNumber: 'РК-2015-0123',
    commissioningDate: '2015-03-10',
    technicalStatus: 'operating',
    equipmentStatus: 'working',
    registeredInRostechnadzor: true,
    internalRegistrationNumber: 'ТЕХ-РК-101',
    rostechnadzorRegistrationNumber: 'РТН-77-РК-00123',
    customDocuments: [],
    expertiseRecords: [],
    maintenanceRecords: [],
    constructionData: [],
    technicalParameters: [
      { id: 'tp6', parameter: 'Рабочее давление', value: '2.5', unit: 'атм' },
      { id: 'tp7', parameter: 'Рабочая температура', value: '180', unit: '°C' }
    ],
    accidents: [],
    rostechnadzorDirectives: [],
    createdAt: '2024-02-10T11:00:00Z',
    updatedAt: '2024-02-10T11:00:00Z',
  }
];

export const useFacilitiesStore = create<FacilitiesState>()(
  persist(
    (set, get) => ({
      facilities: demoFacilities,
      components: demoComponents,
      territorialAuthorities: mockTerritorialAuthorities,
      
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