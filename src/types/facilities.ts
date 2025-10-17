export type FacilityType = 'opo' | 'gts';
export type FacilitySubType = 'tu' | 'zs';
export type HazardClass = 'I' | 'II' | 'III' | 'IV';
export type TechnicalStatus = 'operating' | 'needs_repair' | 'needs_replacement' | 'decommissioned';
export type EquipmentStatus = 'working' | 'in_repair' | 'decommissioned';
export type ComponentType = 'technical_device' | 'building_structure';

export interface Organization {
  id: string;
  tenantId: string;
  fullName: string;
  shortName?: string;
  inn: string;
  kpp?: string;
  ogrn?: string;
  address: string;
  headPosition: string;
  headFullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TerritorialAuthority {
  id: string;
  fullName: string;
  shortName?: string;
  code: string;
  region: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface HazardIdentification {
  id: string;
  category: string;
  description: string;
  quantity?: string;
  unit?: string;
}

export interface FacilityOwner {
  legalEntityFullName: string;
  inn: string;
  headPosition: string;
  headFullName: string;
}

export interface Document {
  id: string;
  type: string;
  number: string;
  date: string;
  validUntil?: string;
  scanUrl?: string;
  notes?: string;
}

export interface Facility {
  id: string;
  tenantId: string;
  organizationId: string;
  organizationName: string;
  type: FacilityType;
  subType?: FacilitySubType;
  parentId?: string;
  fullName: string;
  typicalName?: string;
  registrationNumber?: string;
  industryCode?: string;
  address: string;
  operatingOrganizationId: string;
  operatingOrganizationName: string;
  owner?: FacilityOwner;
  responsiblePersonId?: string;
  responsiblePersonName?: string;
  hazardIdentifications: HazardIdentification[];
  hazardClass?: HazardClass;
  territorialAuthorityId?: string;
  territorialAuthorityName?: string;
  documents: Document[];
  completenessCheck?: {
    hasBasicInfo: boolean;
    hasHazardIdentification: boolean;
    hasClassification: boolean;
    hasDocuments: boolean;
    hasTerritorialAuthority: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConstructionData {
  id: string;
  parameter: string;
  value: string;
  unit?: string;
}

export interface TechnicalParameter {
  id: string;
  parameter: string;
  value: string;
  unit?: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  organization: string;
  reportUrl?: string;
  notes?: string;
}

export interface ExpertiseRecord {
  id: string;
  date: string;
  conclusionNumber: string;
  expertOrganization: string;
  operatingPeriod: string;
  scanUrl?: string;
  notes?: string;
}

export interface AccidentRecord {
  id: string;
  date: string;
  description: string;
}

export interface RostechnadzorDirective {
  id: string;
  date: string;
  description: string;
}

export interface CustomDocument {
  id: string;
  name: string;
  number?: string;
  date?: string;
  scanUrl?: string;
}

export interface FacilityComponent {
  id: string;
  tenantId: string;
  facilityId: string;
  facilityName: string;
  type: ComponentType;
  fullName: string;
  shortName?: string;
  deviceType?: string;
  brand?: string;
  manufacturer?: string;
  manufactureDate?: string;
  installationDate?: string;
  commissioningDate?: string;
  standardOperatingPeriod?: number;
  technicalStatus: TechnicalStatus;
  equipmentStatus: EquipmentStatus;
  registeredInRostechnadzor: boolean;
  internalRegistrationNumber?: string;
  rostechnadzorRegistrationNumber?: string;
  technologicalNumber?: string;
  factoryNumber?: string;
  passportNumber?: string;
  passportDate?: string;
  passportScanUrl?: string;
  projectNumber?: string;
  projectDate?: string;
  projectScanUrl?: string;
  customDocuments: CustomDocument[];
  expertiseRecords: ExpertiseRecord[];
  maintenanceRecords: MaintenanceRecord[];
  constructionData: ConstructionData[];
  technicalParameters: TechnicalParameter[];
  accidents: AccidentRecord[];
  rostechnadzorDirectives: RostechnadzorDirective[];
  createdAt: string;
  updatedAt: string;
}

export interface FacilitiesStats {
  totalFacilities: number;
  opoCount: number;
  gtsCount: number;
  totalComponents: number;
  technicalDevicesCount: number;
  buildingsCount: number;
  needsAttention: number;
}