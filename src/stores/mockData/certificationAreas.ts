// src/stores/mockData/certificationAreas.ts
export const certificationCategories = [
  'Промышленная безопасность',
  'Энергобезопасность',
  'Электробезопасность',
  'Работы на высоте',
] as const;

export const industrialSafetyAreas = [
  'А.1 Основы промышленной безопасности',
  'А.2 Требования промышленной безопасности в химической, нефтехимической и нефтегазоперерабатывающей промышленности',
  'А.3 Требования промышленной безопасности в нефтяной и газовой промышленности',
  'Б.1 Эксплуатация опасных производственных объектов',
  'Б.2 Эксплуатация систем газораспределения и газопотребления',
  'Б.3 Эксплуатация объектов электроэнергетики',
  'Б.7 Эксплуатация химически опасных производственных объектов',
  'В.1 Надзорная деятельность',
] as const;

export const energySafetyAreas = [
  'Электропотребители промышленные 5 группа до и выше 1000В',
  'Тепловые энергоустановки',
  'Электрические сети',
] as const;

export const electricalSafetyAreas = [
  'I группа',
  'II группа до 1000В',
  'III группа до 1000В',
  'IV группа до 1000В',
  'V группа до 1000В',
  'V группа выше 1000В',
] as const;

export const heightWorkAreas = [
  '1 группа',
  '2 группа',
  '3 группа',
] as const;

export const getAreasForCategory = (category: string): readonly string[] => {
  switch (category) {
    case 'Промышленная безопасность':
      return industrialSafetyAreas;
    case 'Энергобезопасность':
      return energySafetyAreas;
    case 'Электробезопасность':
      return electricalSafetyAreas;
    case 'Работы на высоте':
      return heightWorkAreas;
    default:
      return [];
  }
};

type IndustrialSafetyArea = typeof industrialSafetyAreas[number];
type EnergySafetyArea = typeof energySafetyAreas[number];
type ElectricalSafetyArea = typeof electricalSafetyAreas[number];
type HeightWorkArea = typeof heightWorkAreas[number];

export const getCategoryForArea = (area: string): string => {
  if ((industrialSafetyAreas as readonly string[]).includes(area)) {
    return 'Промышленная безопасность';
  }
  if ((energySafetyAreas as readonly string[]).includes(area)) {
    return 'Энергобезопасность';
  }
  if ((electricalSafetyAreas as readonly string[]).includes(area)) {
    return 'Электробезопасность';
  }
  if ((heightWorkAreas as readonly string[]).includes(area)) {
    return 'Работы на высоте';
  }
  return 'Промышленная безопасность';
};