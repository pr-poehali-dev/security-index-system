import type { Organization, Department, Personnel, ProductionSite } from '@/types';

export function exportOrganizationsToCSV(
  organizations: Organization[],
  departments: Department[]
): string {
  const rows = [
    ['Организация', 'ИНН', 'КПП', 'Адрес', 'Подразделение', 'Код', 'Руководитель', 'Статус']
  ];

  organizations.forEach((org) => {
    const orgDepts = departments.filter(d => d.organizationId === org.id && !d.parentId);
    
    if (orgDepts.length === 0) {
      rows.push([
        org.name,
        org.inn,
        org.kpp || '',
        org.address || '',
        '',
        '',
        '',
        org.status === 'active' ? 'Активна' : 'Неактивна'
      ]);
    } else {
      orgDepts.forEach((dept, index) => {
        const childDepts = departments.filter(d => d.parentId === dept.id);
        
        rows.push([
          index === 0 ? org.name : '',
          index === 0 ? org.inn : '',
          index === 0 ? (org.kpp || '') : '',
          index === 0 ? (org.address || '') : '',
          dept.name,
          dept.code || '',
          dept.head || '',
          dept.status === 'active' ? 'Активно' : 'Неактивно'
        ]);

        childDepts.forEach((child) => {
          rows.push([
            '',
            '',
            '',
            '',
            `  └─ ${child.name}`,
            child.code || '',
            child.head || '',
            child.status === 'active' ? 'Активно' : 'Неактивно'
          ]);
        });
      });
    }
  });

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

export function exportPersonnelToCSV(
  personnel: Personnel[],
  organizations: Organization[],
  departments: Department[]
): string {
  const rows = [
    ['Организация', 'Подразделение', 'ФИО', 'Должность', 'Роль', 'Статус', 'Email', 'Телефон', 'Дата приема', 'Дата увольнения']
  ];

  personnel.forEach((person) => {
    const org = organizations.find(o => o.id === person.organizationId);
    const dept = departments.find(d => d.id === person.departmentId);
    
    rows.push([
      org?.name || 'Не указана',
      dept?.name || 'Не указано',
      person.fullName,
      person.position,
      person.role === 'Auditor' ? 'Аудитор' : person.role === 'Manager' ? 'Менеджер' : 'Директор',
      person.status === 'active' ? 'Действующий' : 'Уволен',
      person.email || '',
      person.phone || '',
      person.hireDate ? new Date(person.hireDate).toLocaleDateString('ru-RU') : '',
      person.dismissalDate ? new Date(person.dismissalDate).toLocaleDateString('ru-RU') : ''
    ]);
  });

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

export function downloadCSV(content: string, filename: string) {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSV(content: string): string[][] {
  const lines = content.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    cells.push(current.trim());
    return cells;
  });
}

export async function importOrganizationsFromCSV(
  file: File,
  tenantId: string
): Promise<{ organizations: Omit<Organization, 'id' | 'createdAt'>[]; departments: Omit<Department, 'id' | 'createdAt'>[] }> {
  const content = await file.text();
  const rows = parseCSV(content);
  
  const organizations: Omit<Organization, 'id' | 'createdAt'>[] = [];
  const departments: Omit<Department, 'id' | 'createdAt'>[] = [];
  
  let currentOrgId = '';
  
  for (let i = 1; i < rows.length; i++) {
    const [orgName, inn, kpp, address, deptName, code, head, status] = rows[i];
    
    if (orgName && inn) {
      currentOrgId = `org-${Date.now()}-${i}`;
      
      organizations.push({
        tenantId,
        name: orgName,
        inn,
        kpp: kpp || undefined,
        address: address || undefined,
        status: status === 'Неактивна' ? 'inactive' : 'active'
      });
    }
    
    if (deptName && currentOrgId) {
      departments.push({
        tenantId,
        organizationId: currentOrgId,
        name: deptName.replace('  └─ ', '').trim(),
        code: code || undefined,
        head: head || undefined,
        status: status === 'Неактивно' ? 'inactive' : 'active'
      });
    }
  }
  
  return { organizations, departments };
}

export async function importPersonnelFromCSV(
  file: File,
  tenantId: string,
  organizations: Organization[],
  departments: Department[]
): Promise<Omit<Personnel, 'id' | 'createdAt'>[]> {
  const content = await file.text();
  const rows = parseCSV(content);
  
  const personnel: Omit<Personnel, 'id' | 'createdAt'>[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const [orgName, deptName, fullName, position, roleStr, statusStr, email, phone, hireDateStr, dismissalDateStr] = rows[i];
    
    if (!fullName || !position) continue;
    
    const org = organizations.find(o => o.name === orgName);
    const dept = departments.find(d => d.name === deptName && d.organizationId === org?.id);
    
    const roleMap: Record<string, 'Auditor' | 'Manager' | 'Director'> = {
      'Аудитор': 'Auditor',
      'Менеджер': 'Manager',
      'Директор': 'Director'
    };
    
    personnel.push({
      tenantId,
      organizationId: org?.id,
      departmentId: dept?.id,
      fullName,
      position,
      role: roleMap[roleStr] || 'Manager',
      status: statusStr === 'Уволен' ? 'dismissed' : 'active',
      email: email || undefined,
      phone: phone || undefined,
      hireDate: hireDateStr ? new Date(hireDateStr.split('.').reverse().join('-')).toISOString() : undefined,
      dismissalDate: dismissalDateStr ? new Date(dismissalDateStr.split('.').reverse().join('-')).toISOString() : undefined
    });
  }
  
  return personnel;
}

export function exportToExcel(data: any[], filename: string) {
  import('xlsx').then(XLSX => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Данные');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  });
}

export function exportProductionSitesToExcel(
  sites: ProductionSite[],
  organizations: Organization[]
) {
  const data = sites.map((site) => {
    const org = organizations.find((o) => o.id === site.organizationId);
    return {
      'Организация': org?.name || '—',
      'Название площадки': site.name,
      'Код': site.code || '',
      'Адрес': site.address,
      'Руководитель': site.head || '',
      'Телефон': site.phone || '',
      'Статус': site.status === 'active' ? 'Активна' : 'Неактивна',
      'Дата создания': new Date(site.createdAt).toLocaleDateString('ru-RU')
    };
  });

  exportToExcel(data, 'Производственные_площадки');
}

export async function importProductionSitesFromExcel(
  file: File,
  tenantId: string,
  organizations: Organization[]
): Promise<Omit<ProductionSite, 'id' | 'createdAt'>[]> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

  const sites: Omit<ProductionSite, 'id' | 'createdAt'>[] = [];

  for (const row of rows) {
    const orgName = row['Организация']?.toString().trim();
    const name = row['Название площадки']?.toString().trim();
    const address = row['Адрес']?.toString().trim();

    if (!orgName || !name || !address) continue;

    const org = organizations.find(o => o.name === orgName);
    if (!org) continue;

    sites.push({
      tenantId,
      organizationId: org.id,
      name,
      address,
      code: row['Код']?.toString().trim() || undefined,
      head: row['Руководитель']?.toString().trim() || undefined,
      phone: row['Телефон']?.toString().trim() || undefined,
      status: row['Статус'] === 'Неактивна' ? 'inactive' : 'active'
    });
  }

  return sites;
}