import type { Organization, Personnel } from '@/types';

export function exportOrganizationsToCSV(organizations: Organization[], allOrgs: Organization[]): string {
  const headers = ['ID', 'Организация', 'Подразделение', 'ИНН', 'КПП', 'Адрес', 'Статус'];
  
  const rows = organizations.map(org => {
    const parentOrg = org.parentId ? allOrgs.find(o => o.id === org.parentId) : null;
    
    return [
      org.id,
      parentOrg ? parentOrg.name : org.name,
      parentOrg ? org.name : '',
      org.inn,
      org.kpp || '',
      org.address || '',
      org.status === 'active' ? 'Активна' : 'Неактивна'
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

export function exportPersonnelToCSV(
  personnel: Personnel[], 
  organizations: Organization[]
): string {
  const headers = ['ID', 'Организация', 'Подразделение', 'ФИО', 'Должность', 'Email', 'Телефон', 'Роль', 'Статус', 'Дата приема', 'Дата увольнения'];
  
  const rows = personnel.map(person => {
    const org = organizations.find(o => o.id === person.organizationId);
    const dept = organizations.find(o => o.id === person.departmentId);
    
    // Найти родительскую организацию для подразделения
    const parentOrg = dept?.parentId ? organizations.find(o => o.id === dept.parentId) : org;
    
    const roleMap = {
      'Auditor': 'Аудитор',
      'Manager': 'Менеджер',
      'Director': 'Директор'
    };

    return [
      person.id,
      parentOrg?.name || org?.name || '',
      dept?.name || '',
      person.fullName,
      person.position,
      person.email || '',
      person.phone || '',
      roleMap[person.role] || person.role,
      person.status === 'active' ? 'Действующий' : 'Уволен',
      person.hireDate ? new Date(person.hireDate).toLocaleDateString('ru-RU') : '',
      person.dismissalDate ? new Date(person.dismissalDate).toLocaleDateString('ru-RU') : ''
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
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

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export function parseOrganizationsCSV(content: string, tenantId: string): Organization[] {
  const lines = content.split('\n').filter(line => line.trim());
  const data = lines.slice(1);
  
  const organizations: Organization[] = [];
  
  data.forEach(line => {
    const fields = parseCSVLine(line);
    if (fields.length < 4) return;

    const [, orgName, deptName, inn, kpp, address, statusStr] = fields;
    
    if (!orgName.trim() || !inn.trim()) return;

    const org: Organization = {
      id: `org-import-${Date.now()}-${Math.random()}`,
      tenantId,
      name: orgName.replace(/"/g, '').trim(),
      inn: inn.replace(/"/g, '').trim(),
      kpp: kpp?.replace(/"/g, '').trim() || undefined,
      address: address?.replace(/"/g, '').trim() || undefined,
      status: statusStr?.includes('Активна') ? 'active' : 'inactive',
      createdAt: new Date().toISOString()
    };

    organizations.push(org);

    if (deptName?.trim()) {
      const dept: Organization = {
        id: `dept-import-${Date.now()}-${Math.random()}`,
        tenantId,
        parentId: org.id,
        name: deptName.replace(/"/g, '').trim(),
        inn: org.inn,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      organizations.push(dept);
    }
  });

  return organizations;
}

export function parsePersonnelCSV(content: string, tenantId: string, organizations: Organization[]): Personnel[] {
  const lines = content.split('\n').filter(line => line.trim());
  const data = lines.slice(1);
  
  const personnel: Personnel[] = [];

  data.forEach(line => {
    const fields = parseCSVLine(line);
    if (fields.length < 4) return;

    const [, orgName, deptName, fullName, position, email, phone, roleStr, statusStr, hireDate, dismissalDate] = fields;
    
    if (!fullName.trim() || !position.trim()) return;

    const roleMap: Record<string, 'Auditor' | 'Manager' | 'Director'> = {
      'Аудитор': 'Auditor',
      'Менеджер': 'Manager',
      'Директор': 'Director'
    };

    const org = organizations.find(o => o.name === orgName.replace(/"/g, '').trim() && !o.parentId);
    const dept = deptName?.trim() 
      ? organizations.find(o => o.name === deptName.replace(/"/g, '').trim() && o.parentId === org?.id)
      : undefined;

    const person: Personnel = {
      id: `person-import-${Date.now()}-${Math.random()}`,
      tenantId,
      organizationId: org?.id,
      departmentId: dept?.id,
      fullName: fullName.replace(/"/g, '').trim(),
      position: position.replace(/"/g, '').trim(),
      email: email?.replace(/"/g, '').trim() || undefined,
      phone: phone?.replace(/"/g, '').trim() || undefined,
      role: roleMap[roleStr?.replace(/"/g, '').trim()] || 'Manager',
      status: statusStr?.includes('Действующий') ? 'active' : 'dismissed',
      hireDate: hireDate?.trim() ? new Date(hireDate.replace(/"/g, '')).toISOString() : undefined,
      dismissalDate: dismissalDate?.trim() ? new Date(dismissalDate.replace(/"/g, '')).toISOString() : undefined,
      createdAt: new Date().toISOString()
    };

    personnel.push(person);
  });

  return personnel;
}
