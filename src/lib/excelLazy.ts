let xlsxModule: typeof import('xlsx') | null = null;

export async function getXLSX() {
  if (!xlsxModule) {
    xlsxModule = await import('xlsx');
  }
  return xlsxModule;
}

export async function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: Array<{ key: keyof T; label: string }>,
  filename: string
) {
  const XLSX = await getXLSX();
  
  const headers = columns.map(col => col.label);
  const rows = data.map(item => columns.map(col => item[col.key] ?? ''));
  
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filename);
}

export async function importFromExcel<T>(file: File): Promise<T[]> {
  const XLSX = await getXLSX();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<T>(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}
