export interface Facility {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  regNumber?: string;
  address?: string;
  area?: number;
  capacity?: string;
  hazardClass?: number;
  commissioningDate?: string;
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  responsible?: string;
  phone?: string;
  email?: string;
}

export interface Component {
  id: string;
  facilityId: string;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'repair' | 'decommissioned';
  manufacturer?: string;
  serialNumber?: string;
  commissioningDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  technicalCondition?: 'good' | 'satisfactory' | 'unsatisfactory';
}

export interface GtsSystem {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'under-construction';
  length?: number;
  diameter?: number;
  pressure?: number;
  material?: string;
  commissioningYear?: number;
  lastInspection?: string;
}

export interface Contractor {
  id: string;
  name: string;
  inn: string;
  type: 'maintenance' | 'diagnostics' | 'expertise' | 'construction';
  status: 'active' | 'suspended' | 'contract-expired';
  accreditation?: string;
  accreditationExpiry?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  completedProjects?: number;
  activeProjects?: number;
}

export interface TechnicalDiagnostic {
  id: string;
  equipmentId: string;
  equipmentName: string;
  diagnosticType: string;
  plannedDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'overdue';
  contractorId?: string;
  contractor?: string;
  notes?: string;
  actualDate?: string;
  result?: string;
}

export interface IndustrialSafetyExpertise {
  id: string;
  facilityId: string;
  facilityName: string;
  expertiseType: string;
  plannedDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'overdue';
  expertOrganizationId?: string;
  expertOrganization?: string;
  notes?: string;
  actualDate?: string;
  conclusion?: string;
}

export interface OpoCharacteristic {
  id: string;
  facilityId: string;
  category: string;
  parameter: string;
  value: string;
  unit?: string;
  lastUpdate?: string;
}

// Моковые данные - Объекты ОПО
export const mockFacilities: Facility[] = [
  {
    id: '1',
    name: 'Котельная №1',
    type: 'Котельная',
    status: 'active',
    regNumber: 'А-77-00001',
    address: 'г. Москва, ул. Промышленная, д. 15',
    area: 500,
    capacity: '25 Гкал/ч',
    hazardClass: 2,
    commissioningDate: '2015-06-15',
    lastInspectionDate: '2025-03-10',
    nextInspectionDate: '2026-03-10',
    responsible: 'Иванов И.И.',
    phone: '+7 (495) 123-45-67',
    email: 'kotelnaya1@example.com',
  },
  {
    id: '2',
    name: 'Газопровод высокого давления',
    type: 'Трубопровод',
    status: 'active',
    regNumber: 'Б-77-00123',
    address: 'г. Москва, Промышленная зона',
    hazardClass: 1,
    commissioningDate: '2010-09-20',
    lastInspectionDate: '2024-11-15',
    nextInspectionDate: '2025-11-15',
    responsible: 'Петров П.П.',
    phone: '+7 (495) 234-56-78',
    email: 'gazoprovod@example.com',
  },
  {
    id: '3',
    name: 'Резервуарный парк',
    type: 'Резервуары',
    status: 'active',
    regNumber: 'В-77-00456',
    address: 'г. Москва, ул. Нефтяная, д. 3',
    area: 2000,
    capacity: '5000 м³',
    hazardClass: 2,
    commissioningDate: '2018-04-10',
    lastInspectionDate: '2025-02-20',
    nextInspectionDate: '2026-02-20',
    responsible: 'Сидоров С.С.',
    phone: '+7 (495) 345-67-89',
    email: 'reservuary@example.com',
  },
  {
    id: '4',
    name: 'Компрессорная станция',
    type: 'Компрессорная',
    status: 'maintenance',
    regNumber: 'Г-77-00789',
    address: 'г. Москва, ул. Газовая, д. 7',
    area: 300,
    hazardClass: 2,
    commissioningDate: '2012-11-30',
    lastInspectionDate: '2024-10-05',
    nextInspectionDate: '2025-10-05',
    responsible: 'Кузнецов К.К.',
    phone: '+7 (495) 456-78-90',
    email: 'kompressor@example.com',
  },
];

// Моковые данные - Компоненты оборудования
export const mockComponents: Component[] = [
  {
    id: '1',
    facilityId: '1',
    name: 'Котел паровой КЕ-25-14',
    type: 'Котел',
    status: 'operational',
    manufacturer: 'ОАО "Энергомаш"',
    serialNumber: 'КЕ-25-14-2015-001',
    commissioningDate: '2015-06-15',
    lastMaintenanceDate: '2025-01-15',
    nextMaintenanceDate: '2025-07-15',
    technicalCondition: 'good',
  },
  {
    id: '2',
    facilityId: '1',
    name: 'Насос сетевой НС-1',
    type: 'Насос',
    status: 'operational',
    manufacturer: 'ЗАО "Насосмаш"',
    serialNumber: 'НС-150-2016-045',
    commissioningDate: '2015-06-15',
    lastMaintenanceDate: '2024-12-20',
    nextMaintenanceDate: '2025-12-20',
    technicalCondition: 'satisfactory',
  },
  {
    id: '3',
    facilityId: '2',
    name: 'Трубопровод ГТС-001',
    type: 'Трубопровод',
    status: 'operational',
    manufacturer: 'ООО "Трубопроводмонтаж"',
    serialNumber: 'ГТС-001-2010',
    commissioningDate: '2010-09-20',
    lastMaintenanceDate: '2024-11-15',
    nextMaintenanceDate: '2025-11-15',
    technicalCondition: 'good',
  },
  {
    id: '4',
    facilityId: '3',
    name: 'Резервуар РВС-5000',
    type: 'Резервуар',
    status: 'operational',
    manufacturer: 'ПАО "Резервуарстрой"',
    serialNumber: 'РВС-5000-2018-001',
    commissioningDate: '2018-04-10',
    lastMaintenanceDate: '2025-02-20',
    nextMaintenanceDate: '2026-02-20',
    technicalCondition: 'good',
  },
  {
    id: '5',
    facilityId: '4',
    name: 'Компрессор ВП-100',
    type: 'Компрессор',
    status: 'maintenance',
    manufacturer: 'АО "Компрессормаш"',
    serialNumber: 'ВП-100-2012-078',
    commissioningDate: '2012-11-30',
    lastMaintenanceDate: '2025-09-10',
    nextMaintenanceDate: '2025-12-10',
    technicalCondition: 'satisfactory',
  },
];

// Моковые данные - ГТС
export const mockGtsSystems: GtsSystem[] = [
  {
    id: '1',
    name: 'Газопровод магистральный ГП-1',
    type: 'Магистральный',
    status: 'active',
    length: 15.5,
    diameter: 530,
    pressure: 5.5,
    material: 'Сталь 17Г1С',
    commissioningYear: 2010,
    lastInspection: '2024-11-15',
  },
  {
    id: '2',
    name: 'Газопровод распределительный ГП-2',
    type: 'Распределительный',
    status: 'active',
    length: 8.2,
    diameter: 325,
    pressure: 1.2,
    material: 'Сталь 20',
    commissioningYear: 2015,
    lastInspection: '2025-03-20',
  },
  {
    id: '3',
    name: 'Газопровод низкого давления ГП-3',
    type: 'Низкого давления',
    status: 'active',
    length: 12.0,
    diameter: 219,
    pressure: 0.3,
    material: 'Полиэтилен ПЭ-100',
    commissioningYear: 2018,
    lastInspection: '2025-01-10',
  },
];

// Моковые данные - Подрядчики
export const mockContractors: Contractor[] = [
  {
    id: '1',
    name: 'ООО "ТехДиагностика"',
    inn: '7701234567',
    type: 'diagnostics',
    status: 'active',
    accreditation: 'Аттестат аккредитации №РОСС RU.0001.11АБ12',
    accreditationExpiry: '2026-12-31',
    contactPerson: 'Соколов А.В.',
    phone: '+7 (495) 111-22-33',
    email: 'info@techdiag.ru',
    completedProjects: 45,
    activeProjects: 3,
  },
  {
    id: '2',
    name: 'ООО "ПромЭксперт"',
    inn: '7702345678',
    type: 'expertise',
    status: 'active',
    accreditation: 'Аттестат аккредитации №РОСС RU.0001.11ПЭ34',
    accreditationExpiry: '2027-06-30',
    contactPerson: 'Морозов В.Г.',
    phone: '+7 (495) 222-33-44',
    email: 'contact@promexpert.ru',
    completedProjects: 78,
    activeProjects: 5,
  },
  {
    id: '3',
    name: 'ООО "СпецКонтроль"',
    inn: '7703456789',
    type: 'diagnostics',
    status: 'active',
    accreditation: 'Аттестат аккредитации №РОСС RU.0001.11СК56',
    accreditationExpiry: '2026-03-31',
    contactPerson: 'Новиков Д.И.',
    phone: '+7 (495) 333-44-55',
    email: 'info@speckontrol.ru',
    completedProjects: 62,
    activeProjects: 4,
  },
  {
    id: '4',
    name: 'ООО "ПромБезопасность"',
    inn: '7704567890',
    type: 'expertise',
    status: 'active',
    accreditation: 'Аттестат аккредитации №РОСС RU.0001.11ПБ78',
    accreditationExpiry: '2027-12-31',
    contactPerson: 'Волков Е.Н.',
    phone: '+7 (495) 444-55-66',
    email: 'info@prombez.ru',
    completedProjects: 93,
    activeProjects: 6,
  },
  {
    id: '5',
    name: 'АО "Экспертцентр"',
    inn: '7705678901',
    type: 'expertise',
    status: 'active',
    accreditation: 'Аттестат аккредитации №РОСС RU.0001.11ЭЦ90',
    accreditationExpiry: '2028-03-31',
    contactPerson: 'Федоров М.П.',
    phone: '+7 (495) 555-66-77',
    email: 'info@expertcenter.ru',
    completedProjects: 124,
    activeProjects: 8,
  },
];

// Моковые данные - Технические диагностики
export const mockTechnicalDiagnostics: TechnicalDiagnostic[] = [
  {
    id: '1',
    equipmentId: '1',
    equipmentName: 'Котел паровой КЕ-25-14',
    diagnosticType: 'Полное обследование',
    plannedDate: '2025-11-15',
    status: 'planned',
    contractorId: '1',
    contractor: 'ООО "ТехДиагностика"',
    notes: 'Плановое обследование согласно графику',
  },
  {
    id: '2',
    equipmentId: '3',
    equipmentName: 'Трубопровод ГТС-001',
    diagnosticType: 'УЗК толщины стенок',
    plannedDate: '2025-10-20',
    status: 'in-progress',
    contractorId: '3',
    contractor: 'ООО "СпецКонтроль"',
  },
  {
    id: '3',
    equipmentId: '4',
    equipmentName: 'Резервуар РВС-5000',
    diagnosticType: 'Визуальный контроль',
    plannedDate: '2025-09-30',
    status: 'overdue',
    contractorId: '3',
    contractor: 'ООО "СпецКонтроль"',
    notes: 'Требуется согласование доступа',
  },
  {
    id: '4',
    equipmentId: '2',
    equipmentName: 'Насос сетевой НС-1',
    diagnosticType: 'Вибродиагностика',
    plannedDate: '2025-12-01',
    status: 'planned',
    contractorId: '1',
    contractor: 'ООО "ТехДиагностика"',
  },
  {
    id: '5',
    equipmentId: '5',
    equipmentName: 'Компрессор ВП-100',
    diagnosticType: 'НК методами',
    plannedDate: '2025-08-15',
    status: 'completed',
    contractorId: '1',
    contractor: 'ООО "ТехДиагностика"',
    actualDate: '2025-08-14',
    result: 'Замечаний не выявлено',
  },
];

// Моковые данные - Экспертизы промышленной безопасности
export const mockIndustrialSafetyExpertises: IndustrialSafetyExpertise[] = [
  {
    id: '1',
    facilityId: '1',
    facilityName: 'ОПО "Котельная №1"',
    expertiseType: 'Полная ЭПБ',
    plannedDate: '2025-12-10',
    status: 'planned',
    expertOrganizationId: '4',
    expertOrganization: 'ООО "ПромБезопасность"',
    notes: 'Истекает срок действия предыдущей экспертизы',
  },
  {
    id: '2',
    facilityId: '2',
    facilityName: 'ОПО "Газопровод высокого давления"',
    expertiseType: 'Проектная документация',
    plannedDate: '2025-10-25',
    status: 'in-progress',
    expertOrganizationId: '5',
    expertOrganization: 'АО "Экспертцентр"',
  },
  {
    id: '3',
    facilityId: '3',
    facilityName: 'ОПО "Резервуарный парк"',
    expertiseType: 'Полная ЭПБ',
    plannedDate: '2025-10-05',
    status: 'overdue',
    expertOrganizationId: '2',
    expertOrganization: 'ООО "ПромЭксперт"',
    notes: 'Ожидание документов от производителя',
  },
  {
    id: '4',
    facilityId: '4',
    facilityName: 'ОПО "Компрессорная станция"',
    expertiseType: 'Технические устройства',
    plannedDate: '2025-11-20',
    status: 'planned',
    expertOrganizationId: '2',
    expertOrganization: 'ООО "ПромЭксперт"',
  },
];

// Моковые данные - Характеристики ОПО
export const mockOpoCharacteristics: OpoCharacteristic[] = [
  {
    id: '1',
    facilityId: '1',
    category: 'Технические характеристики',
    parameter: 'Производительность',
    value: '25',
    unit: 'Гкал/ч',
    lastUpdate: '2025-03-10',
  },
  {
    id: '2',
    facilityId: '1',
    category: 'Технические характеристики',
    parameter: 'Рабочее давление',
    value: '14',
    unit: 'кгс/см²',
    lastUpdate: '2025-03-10',
  },
  {
    id: '3',
    facilityId: '1',
    category: 'Персонал',
    parameter: 'Численность работников',
    value: '12',
    unit: 'чел.',
    lastUpdate: '2025-01-01',
  },
  {
    id: '4',
    facilityId: '2',
    category: 'Технические характеристики',
    parameter: 'Протяженность',
    value: '15.5',
    unit: 'км',
    lastUpdate: '2024-11-15',
  },
  {
    id: '5',
    facilityId: '2',
    category: 'Технические характеристики',
    parameter: 'Давление транспортировки',
    value: '5.5',
    unit: 'МПа',
    lastUpdate: '2024-11-15',
  },
  {
    id: '6',
    facilityId: '3',
    category: 'Технические характеристики',
    parameter: 'Общий объем хранения',
    value: '5000',
    unit: 'м³',
    lastUpdate: '2025-02-20',
  },
  {
    id: '7',
    facilityId: '3',
    category: 'Вещества',
    parameter: 'Тип хранимого продукта',
    value: 'Нефтепродукты светлые',
    lastUpdate: '2025-02-20',
  },
];
