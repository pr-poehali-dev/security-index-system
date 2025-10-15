import type { HazardClass } from '@/types/catalog';

export const HAZARD_CLASS_LABELS: Record<HazardClass, string> = {
  'I': 'I класс (чрезвычайно высокая опасность)',
  'II': 'II класс (высокая опасность)',
  'III': 'III класс (средняя опасность)',
  'IV': 'IV класс (низкая опасность)'
};

export const HAZARD_CLASS_SHORT_LABELS: Record<HazardClass, string> = {
  'I': 'I класс',
  'II': 'II класс',
  'III': 'III класс',
  'IV': 'IV класс'
};

export const HAZARD_CLASS_COLORS: Record<HazardClass, string> = {
  'I': 'bg-red-600',
  'II': 'bg-orange-600',
  'III': 'bg-yellow-600',
  'IV': 'bg-green-600'
};

export const HAZARD_CLASS_OPTIONS: Array<{ value: HazardClass; label: string }> = [
  { value: 'I', label: HAZARD_CLASS_LABELS['I'] },
  { value: 'II', label: HAZARD_CLASS_LABELS['II'] },
  { value: 'III', label: HAZARD_CLASS_LABELS['III'] },
  { value: 'IV', label: HAZARD_CLASS_LABELS['IV'] }
];
