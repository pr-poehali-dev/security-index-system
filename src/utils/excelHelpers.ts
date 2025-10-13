export async function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: Record<keyof T, string>,
  sheetName: string,
  fileName: string
) {
  const { utils, writeFile } = await import('xlsx');
  
  const exportData = data.map(item => {
    const row: Record<string, any> = {};
    Object.entries(columns).forEach(([key, label]) => {
      row[label as string] = item[key];
    });
    return row;
  });

  const ws = utils.json_to_sheet(exportData);
  
  const colWidths = Object.values(columns).map(label => ({
    wch: Math.max(label.length, 15)
  }));
  ws['!cols'] = colWidths;

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, sheetName);

  const fullFileName = `${fileName}_${new Date().toLocaleDateString('ru')}.xlsx`;
  writeFile(wb, fullFileName);
}

export function setExcelColumnWidths(widths: number[]) {
  return widths.map(wch => ({ wch }));
}
