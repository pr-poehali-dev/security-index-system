import type { IndustrialObject } from '@/types/catalog';
import type { OpoCharacteristic, DataStatus } from './types';

export function calculateDataStatus(
  obj: IndustrialObject,
  getOrganizationName: (id: string) => string
): OpoCharacteristic {
  const missingFields: string[] = [];
  let filledFields = 0;
  const totalFields = 20;

  if (!obj.registrationNumber) missingFields.push('Регистрационный номер');
  else filledFields++;

  if (!obj.commissioningDate) missingFields.push('Дата ввода в эксплуатацию');
  else filledFields++;

  if (!obj.hazardClass) missingFields.push('Класс опасности');
  else filledFields++;

  if (!obj.location.address) missingFields.push('Адрес расположения');
  else filledFields++;

  if (!obj.responsiblePerson) missingFields.push('Ответственное лицо');
  else filledFields++;

  if (!obj.detailedAddress?.region) missingFields.push('Субъект РФ');
  else filledFields++;

  if (!obj.detailedAddress?.oktmo) missingFields.push('Код ОКТМО');
  else filledFields++;

  if (!obj.industryCode) missingFields.push('Код отрасли');
  else filledFields++;

  if (!obj.dangerSigns || obj.dangerSigns.length === 0) missingFields.push('Признаки опасности');
  else filledFields++;

  if (!obj.classifications || obj.classifications.length === 0) missingFields.push('Классификация ОПО');
  else filledFields++;

  if (!obj.hazardClassJustification) missingFields.push('Обоснование класса опасности');
  else filledFields++;

  if (!obj.licensedActivities || obj.licensedActivities.length === 0) missingFields.push('Лицензируемая деятельность');
  else filledFields++;

  if (!obj.registrationDate) missingFields.push('Дата регистрации в РТН');
  else filledFields++;

  if (!obj.rtnDepartmentId) missingFields.push('Орган РТН');
  else filledFields++;

  if (!obj.nextExpertiseDate) missingFields.push('Дата следующей экспертизы');
  else filledFields++;

  if (!obj.nextDiagnosticDate) missingFields.push('Дата следующей диагностики');
  else filledFields++;

  if (!obj.documents || obj.documents.length === 0) missingFields.push('Документы ОПО');
  else filledFields++;

  if (!obj.detailedAddress?.postalCode) missingFields.push('Почтовый индекс');
  else filledFields++;

  if (!obj.location.coordinates) missingFields.push('GPS координаты');
  else filledFields++;

  if (!obj.ownerId) missingFields.push('Владелец объекта');
  else filledFields++;

  const completeness = Math.round((filledFields / totalFields) * 100);
  const dataStatus: DataStatus = completeness >= 80 ? 'sufficient' : 'insufficient';

  return {
    objectId: obj.id,
    organizationName: getOrganizationName(obj.organizationId),
    objectType: obj.type,
    objectName: obj.name,
    registrationNumber: obj.registrationNumber,
    dataStatus,
    completeness,
    missingFields,
  };
}

export async function generateZipArchive(
  characteristicsData: OpoCharacteristic[],
  objects: IndustrialObject[],
  objectTypeLabels: Record<string, string>
): Promise<void> {
  const sufficientObjects = characteristicsData.filter((item) => item.dataStatus === 'sufficient');
  
  if (sufficientObjects.length === 0) {
    alert('Нет объектов с достаточными данными для формирования');
    return;
  }

  try {
    const zip = await import('jszip');
    const JSZip = zip.default;
    const zipFile = new JSZip();

    sufficientObjects.forEach((item) => {
      const obj = objects.find((o) => o.id === item.objectId);
      if (!obj) return;

      const content = `СВЕДЕНИЯ, ХАРАКТЕРИЗУЮЩИЕ ОПАСНЫЙ ПРОИЗВОДСТВЕННЫЙ ОБЪЕКТ

` +
        `Регистрационный номер: ${obj.registrationNumber}
` +
        `Наименование: ${obj.name}
` +
        `Организация: ${item.organizationName}
` +
        `Тип объекта: ${objectTypeLabels[obj.type]}
` +
        `Класс опасности: ${obj.hazardClass || '-'}
` +
        `Адрес: ${obj.location.address}
` +
        `Субъект РФ: ${obj.detailedAddress?.region || '-'}
` +
        `Код ОКТМО: ${obj.detailedAddress?.oktmo || '-'}
` +
        `Почтовый индекс: ${obj.detailedAddress?.postalCode || '-'}
` +
        `GPS координаты: ${obj.location.coordinates || '-'}
` +
        `Дата ввода в эксплуатацию: ${obj.commissioningDate || '-'}
` +
        `Ответственное лицо: ${obj.responsiblePerson || '-'}
` +
        `Владелец: ${obj.ownerId || '-'}
` +
        `Код отрасли: ${obj.industryCode || '-'}
` +
        `Признаки опасности: ${obj.dangerSigns?.join(', ') || '-'}
` +
        `Классификация: ${obj.classifications?.join(', ') || '-'}
` +
        `Обоснование класса опасности: ${obj.hazardClassJustification || '-'}
` +
        `Лицензируемая деятельность: ${obj.licensedActivities?.join(', ') || '-'}
` +
        `Дата регистрации в РТН: ${obj.registrationDate || '-'}
` +
        `Орган РТН: ${obj.rtnDepartmentId || '-'}
` +
        `Дата следующей экспертизы: ${obj.nextExpertiseDate || '-'}
` +
        `Дата следующей диагностики: ${obj.nextDiagnosticDate || '-'}
` +
        `Документы: ${obj.documents?.length || 0} шт.`;

      const fileName = `${obj.registrationNumber || obj.id}_${obj.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.txt`;
      zipFile.file(fileName, content);
    });

    const blob = await zipFile.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `сведения_ОПО_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка формирования архива:', error);
    alert('Произошла ошибка при формировании архива');
  }
}
