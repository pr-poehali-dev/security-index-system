// src/modules/attestation/utils/orderExport.ts
// Описание: Утилиты для экспорта приказов и приложений к ним

import type { Order } from '@/stores/ordersStore';

interface ExportOrderData {
  order: Order;
  employees: Array<{
    id: string;
    name: string;
    position: string;
    department: string;
    organization: string;
  }>;
}

/**
 * Генерирует приложение к приказу в формате Excel
 * Содержит таблицу с сотрудниками и их областями аттестации
 */
export async function generateOrderAppendix(data: ExportOrderData) {
  const { utils, writeFile } = await import('xlsx');
  const { order, employees } = data;

  if (!order.certifications || order.certifications.length === 0) {
    throw new Error('В приказе отсутствуют данные об областях аттестации');
  }

  // Группируем сертификации по сотрудникам
  const employeeData = new Map<string, Array<{ category: string; area: string }>>();
  
  order.certifications.forEach(cert => {
    const existing = employeeData.get(cert.personnelId) || [];
    existing.push({
      category: cert.category,
      area: cert.area
    });
    employeeData.set(cert.personnelId, existing);
  });

  // Формируем данные для Excel
  const exportData: Array<Record<string, string | number>> = [];
  let rowNumber = 1;

  employeeData.forEach((certs, personnelId) => {
    const employee = employees.find(e => e.id === personnelId);
    if (!employee) return;

    certs.forEach((cert, index) => {
      exportData.push({
        '№ п/п': index === 0 ? rowNumber : '',
        'ФИО': index === 0 ? employee.name : '',
        'Должность': index === 0 ? employee.position : '',
        'Подразделение': index === 0 ? employee.department : '',
        'Организация': index === 0 ? employee.organization : '',
        'Категория аттестации': cert.category,
        'Область аттестации': cert.area,
        'Отметка о наличии действующего ДПО': '' // Заполняется вручную или автоматически
      });
    });
    rowNumber++;
  });

  const ws = utils.json_to_sheet(exportData);

  // Настройка ширины колонок
  const colWidths = [
    { wch: 8 },  // № п/п
    { wch: 30 }, // ФИО
    { wch: 35 }, // Должность
    { wch: 30 }, // Подразделение
    { wch: 40 }, // Организация
    { wch: 25 }, // Категория
    { wch: 60 }, // Область аттестации
    { wch: 35 }  // Отметка о ДПО
  ];
  ws['!cols'] = colWidths;

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Приложение к приказу');

  const fileName = `Приложение_к_приказу_${order.number.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toLocaleDateString('ru')}.xlsx`;
  writeFile(wb, fileName);
}

/**
 * Генерирует полный отчёт по приказу (основная информация + приложение)
 */
export async function generateFullOrderReport(data: ExportOrderData) {
  const { utils, writeFile } = await import('xlsx');
  const { order, employees } = data;

  // Лист 1: Основная информация о приказе
  const orderInfo = [
    ['ПРИКАЗ'],
    [''],
    ['Номер:', order.number],
    ['Дата:', new Date(order.date).toLocaleDateString('ru')],
    ['Тип:', getOrderTypeLabel(order.type)],
    ['Название:', order.title],
    ['Описание:', order.description || ''],
    ['Статус:', getOrderStatusLabel(order.status)],
    ['Создал:', order.createdBy],
    [''],
    ['Всего сотрудников:', order.employeeIds.length],
    ['Всего областей аттестации:', order.certifications?.length || 0]
  ];

  const ws1 = utils.aoa_to_sheet(orderInfo);
  ws1['!cols'] = [{ wch: 30 }, { wch: 60 }];

  // Лист 2: Приложение с сотрудниками и областями
  const exportData: Array<Record<string, string | number>> = [];
  
  if (order.certifications && order.certifications.length > 0) {
    const employeeData = new Map<string, Array<{ category: string; area: string }>>();
    
    order.certifications.forEach(cert => {
      const existing = employeeData.get(cert.personnelId) || [];
      existing.push({
        category: cert.category,
        area: cert.area
      });
      employeeData.set(cert.personnelId, existing);
    });

    let rowNumber = 1;
    employeeData.forEach((certs, personnelId) => {
      const employee = employees.find(e => e.id === personnelId);
      if (!employee) return;

      certs.forEach((cert, index) => {
        exportData.push({
          '№ п/п': index === 0 ? rowNumber : '',
          'ФИО': index === 0 ? employee.name : '',
          'Должность': index === 0 ? employee.position : '',
          'Подразделение': index === 0 ? employee.department : '',
          'Организация': index === 0 ? employee.organization : '',
          'Категория аттестации': cert.category,
          'Область аттестации': cert.area,
          'Отметка о наличии действующего ДПО': ''
        });
      });
      rowNumber++;
    });
  }

  const ws2 = utils.json_to_sheet(exportData);
  ws2['!cols'] = [
    { wch: 8 }, { wch: 30 }, { wch: 35 }, { wch: 30 }, 
    { wch: 40 }, { wch: 25 }, { wch: 60 }, { wch: 35 }
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws1, 'Приказ');
  utils.book_append_sheet(wb, ws2, 'Приложение');

  const fileName = `Приказ_${order.number.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toLocaleDateString('ru')}.xlsx`;
  writeFile(wb, fileName);
}

function getOrderTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    attestation: 'Аттестация',
    training: 'Обучение',
    suspension: 'Отстранение',
    lms: 'СДО',
    internal: 'Внутренняя аттестация'
  };
  return labels[type] || type;
}

function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Черновик',
    prepared: 'Подготовлен',
    approved: 'Согласован',
    active: 'Действует',
    completed: 'Выполнен',
    cancelled: 'Отменён'
  };
  return labels[status] || status;
}
