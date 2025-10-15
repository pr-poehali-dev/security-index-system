export interface TypicalOpoName {
  id: string;
  code: string;
  name: string;
}

export interface DangerSign {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface OpoClassification {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface DangerSubstanceType {
  id: string;
  name: string;
  group: 'individual' | 'group';
}

export interface DangerSubstance {
  id: string;
  name: string;
  typeId: string;
  thresholdClass1?: number;
  thresholdClass2?: number;
  thresholdClass3?: number;
  thresholdClass4?: number;
}

export interface RtnDepartment {
  id: string;
  fullName: string;
  regionCode: string;
}

export interface LicensedActivity {
  id: string;
  code: string;
  name: string;
}
