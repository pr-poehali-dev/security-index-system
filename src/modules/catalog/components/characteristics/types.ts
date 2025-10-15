import type { ObjectType } from '@/types/catalog';

export type DataStatus = 'sufficient' | 'insufficient';

export interface OpoCharacteristic {
  objectId: string;
  organizationName: string;
  objectType: ObjectType;
  objectName: string;
  registrationNumber: string;
  dataStatus: DataStatus;
  completeness: number;
  missingFields: string[];
}

export interface OpoStats {
  total: number;
  sufficient: number;
  insufficient: number;
  avgCompleteness: number;
}

export const objectTypeLabels: Record<ObjectType, string> = {
  opo: 'ОПО',
  gts: 'ГТС',
  building: 'Здание/Сооружение',
};
