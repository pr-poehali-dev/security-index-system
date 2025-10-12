// src/utils/export.ts
import * as XLSX from 'xlsx';

export interface ExportColumn<T> {
  key: keyof T | string;
  label: string;
  format?: (value: any, item: T) => string | number;
}

export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  const headers = columns.map(col => col.label).join(',');
  
  const rows = data.map(item => {
    return columns.map(col => {
      let value: any;
      
      if (col.key.toString().includes('.')) {
        const keys = col.key.toString().split('.');
        value = keys.reduce((obj: any, key) => obj?.[key], item);
      } else {
        value = item[col.key as keyof T];
      }
      
      if (col.format) {
        value = col.format(value, item);
      }
      
      const stringValue = value?.toString() || '';
      
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });
  
  const csv = [headers, ...rows].join('\n');
  
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName: string = 'Данные'
): void {
  const headers = columns.map(col => col.label);
  
  const rows = data.map(item => {
    return columns.map(col => {
      let value: any;
      
      if (col.key.toString().includes('.')) {
        const keys = col.key.toString().split('.');
        value = keys.reduce((obj: any, key) => obj?.[key], item);
      } else {
        value = item[col.key as keyof T];
      }
      
      if (col.format) {
        value = col.format(value, item);
      }
      
      return value ?? '';
    });
  });
  
  const wsData = [headers, ...rows];
  
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  const colWidths = columns.map((_, colIndex) => {
    const maxLength = Math.max(
      headers[colIndex].length,
      ...rows.map(row => (row[colIndex]?.toString() || '').length)
    );
    return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
  });
  ws['!cols'] = colWidths;
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
}