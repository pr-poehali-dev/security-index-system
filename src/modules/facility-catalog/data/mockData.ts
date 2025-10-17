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
