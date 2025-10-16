// src/utils/export.ts
import * as XLSX from 'xlsx';

export interface ExportColumn<T> {
  key: keyof T | string;
  label: string;
  format?: (value: unknown, item: T) => string | number;
  width?: number;
}

function getValue<T>(item: T, key: keyof T | string): unknown {
  if (key.toString().includes('.')) {
    const keys = key.toString().split('.');
    return keys.reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], item as unknown);
  }
  return item[key as keyof T];
}

export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  const headers = columns.map(col => col.label).join(',');
  
  const rows = data.map(item => {
    return columns.map(col => {
      let value = getValue(item, col.key);
      
      if (col.format) {
        value = col.format(value, item);
      }
      
      const stringValue = (value as string | number | undefined)?.toString() || '';
      
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
      let value = getValue(item, col.key);
      
      if (col.format) {
        value = col.format(value, item);
      }
      
      return value ?? '';
    });
  });
  
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  const colWidths = columns.map((col, colIndex) => {
    if (col.width) return { wch: col.width };
    
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

export async function exportToExcelAsync<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName: string = 'Данные'
): Promise<void> {
  const XLSX = await import('xlsx');
  
  const headers = columns.map(col => col.label);
  const rows = data.map(item => columns.map(col => {
    const value = getValue(item, col.key);
    return col.format ? col.format(value, item) : value ?? '';
  }));
  
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  const colWidths = columns.map((col, colIndex) => {
    if (col.width) return { wch: col.width };
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

export async function importFromExcel<T>(file: File): Promise<T[]> {
  const XLSX = await import('xlsx');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<T>(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}