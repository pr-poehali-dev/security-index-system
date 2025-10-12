import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { IssuedCertificate } from '@/stores/trainingCenterStore';
import type { Organization, Personnel } from '@/types';

const statusLabels = {
  issued: 'Выдано',
  delivered: 'Передано клиенту',
  synced: 'Синхронизировано'
};

const categoryLabels = {
  industrial_safety: 'Промбезопасность',
  energy_safety: 'Энергобезопасность',
  labor_safety: 'Охрана труда',
  ecology: 'Экология'
};

export function useCertificatesExport(
  certificates: IssuedCertificate[],
  organizations: Organization[],
  personnel: Personnel[]
) {
  const handleExport = () => {
    const dataToExport = certificates.map(cert => {
      const person = personnel.find(p => p.id === cert.personnelId);
      const organization = person?.organizationId 
        ? organizations.find(o => o.id === person.organizationId)
        : organizations.find(o => o.id === cert.organizationId);
      
      return {
        'ФИО': cert.personnelName,
        'Организация': organization?.name || cert.organizationName || 'Не указана',
        'ИНН организации': organization?.inn || cert.organizationInn || '',
        'Номер удостоверения': cert.certificateNumber,
        'Программа обучения': cert.programName,
        'Категория': categoryLabels[cert.category as keyof typeof categoryLabels] || cert.category,
        'Номер протокола': cert.protocolNumber,
        'Дата протокола': format(new Date(cert.protocolDate), 'dd.MM.yyyy', { locale: ru }),
        'Дата выдачи': format(new Date(cert.issueDate), 'dd.MM.yyyy', { locale: ru }),
        'Срок действия': format(new Date(cert.expiryDate), 'dd.MM.yyyy', { locale: ru }),
        'Область аттестации': cert.area || '',
        'Статус': statusLabels[cert.status as keyof typeof statusLabels] || cert.status
      };
    });

    const headers = Object.keys(dataToExport[0] || {});
    const csvContent = [
      headers.join(';'),
      ...dataToExport.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row] || '';
          return typeof value === 'string' && (value.includes(';') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(';')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `удостоверения_реестр_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { handleExport };
}
