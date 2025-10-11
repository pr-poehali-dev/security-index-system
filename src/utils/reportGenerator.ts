import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Task } from '@/types';
import type { Incident } from '@/types';
import type { Organization } from '@/types';

interface IndustrialObject {
  id: string;
  organizationId: string;
  name: string;
  status: 'active' | 'inactive';
  expertiseDate?: string;
  nextExpertiseDate?: string;
}

export type ReportPeriod = 'week' | 'month' | 'quarter' | 'all';

const getDateRangeForPeriod = (period: ReportPeriod): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'all':
      start.setFullYear(2000);
      break;
  }
  
  return { start, end };
};

const getPeriodLabel = (period: ReportPeriod): string => {
  switch (period) {
    case 'week': return 'za nedelyu';
    case 'month': return 'za mesyac';
    case 'quarter': return 'za kvartal';
    case 'all': return 'za vse vremya';
  }
};

const filterTasksByPeriod = (tasks: Task[], period: ReportPeriod): Task[] => {
  if (period === 'all') return tasks;
  const { start } = getDateRangeForPeriod(period);
  return tasks.filter(task => new Date(task.createdAt) >= start);
};

const filterIncidentsByPeriod = (incidents: Incident[], period: ReportPeriod): Incident[] => {
  if (period === 'all') return incidents;
  const { start } = getDateRangeForPeriod(period);
  return incidents.filter(incident => new Date(incident.createdAt) >= start);
};

// Расширяем тип jsPDF для autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

// Загрузка шрифта с поддержкой кириллицы
const loadFont = async (doc: jsPDF) => {
  // Используем встроенный шрифт с кириллицей
  doc.setFont('helvetica');
};

export const generateDashboardReport = async (data: {
  stats: {
    totalObjects: number;
    activeObjects: number;
    openTasks: number;
    tasksInProgress: number;
    overdueTasks: number;
    openIncidents: number;
    criticalIncidents: number;
    expertiseOverdue: number;
  };
  tasks: Task[];
  incidents: Incident[];
  objects: IndustrialObject[];
  organizations: Organization[];
}, period: ReportPeriod = 'all') => {
  const filteredTasks = filterTasksByPeriod(data.tasks, period);
  const filteredIncidents = filterIncidentsByPeriod(data.incidents, period);
  const periodLabel = getPeriodLabel(period);
  const doc = new jsPDF();
  await loadFont(doc);
  
  let yPos = 20;

  // Заголовок
  doc.setFontSize(18);
  doc.text(`Otchet po sisteme (${periodLabel})`, 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('ru-RU')}`, 20, yPos);
  yPos += 15;

  // Блок статистики
  doc.setFontSize(14);
  doc.text('Obshchaya statistika', 20, yPos);
  yPos += 10;

  const statsData = [
    ['Vsego obektov', data.stats.totalObjects.toString()],
    ['Aktivnykh obektov', data.stats.activeObjects.toString()],
    ['Otkrytykh zadach', data.stats.openTasks.toString()],
    ['Zadach v rabote', data.stats.tasksInProgress.toString()],
    ['Prosrochennykh zadach', data.stats.overdueTasks.toString()],
    ['Otkrytykh incidentov', data.stats.openIncidents.toString()],
    ['Kriticheskikh incidentov', data.stats.criticalIncidents.toString()],
    ['Prosrocheno EPB', data.stats.expertiseOverdue.toString()]
  ];

  doc.autoTable({
    startY: yPos,
    head: [['Pokazatel', 'Znachenie']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94] }
  });

  yPos = doc.lastAutoTable?.finalY || yPos + 60;
  yPos += 10;

  // Критические задачи за период
  if (filteredTasks.length > 0) {
    doc.setFontSize(14);
    doc.text('Kriticheskie zadachi', 20, yPos);
    yPos += 10;

    const tasksData = filteredTasks.slice(0, 10).map(task => [
      task.title.substring(0, 40),
      task.priority === 'critical' ? 'Kritich.' : 
      task.priority === 'high' ? 'Vysokiy' : 
      task.priority === 'medium' ? 'Sredniy' : 'Nizkiy',
      task.status === 'open' ? 'Otkryto' : 
      task.status === 'in_progress' ? 'V rabote' : 'Zaversheno',
      task.dueDate ? new Date(task.dueDate).toLocaleDateString('ru-RU') : '-'
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Nazvanie', 'Prioritet', 'Status', 'Srok']],
      body: tasksData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });

    yPos = doc.lastAutoTable?.finalY || yPos + 60;
  }

  // Сохранение файла
  const fileName = `Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const generateTasksReport = async (tasks: Task[], period: ReportPeriod = 'all') => {
  const filteredTasks = filterTasksByPeriod(tasks, period);
  const periodLabel = getPeriodLabel(period);
  const doc = new jsPDF();
  await loadFont(doc);

  let yPos = 20;

  doc.setFontSize(18);
  doc.text(`Otchet po zadacham (${periodLabel})`, 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('ru-RU')}`, 20, yPos);
  yPos += 15;

  // Статистика за период
  const total = filteredTasks.length;
  const open = filteredTasks.filter(t => t.status === 'open').length;
  const inProgress = filteredTasks.filter(t => t.status === 'in_progress').length;
  const completed = filteredTasks.filter(t => t.status === 'completed').length;
  const critical = filteredTasks.filter(t => t.priority === 'critical').length;

  const statsData = [
    ['Vsego zadach', total.toString()],
    ['Otkryto', open.toString()],
    ['V rabote', inProgress.toString()],
    ['Zaversheno', completed.toString()],
    ['Kriticheskikh', critical.toString()]
  ];

  doc.autoTable({
    startY: yPos,
    head: [['Pokazatel', 'Znachenie']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }
  });

  yPos = doc.lastAutoTable?.finalY || yPos + 40;
  yPos += 10;

  // Таблица задач за период
  const tasksData = filteredTasks.map(task => [
    task.title.substring(0, 35),
    task.assignee?.substring(0, 20) || '-',
    task.priority === 'critical' ? 'Krit.' : 
    task.priority === 'high' ? 'Vys.' : 
    task.priority === 'medium' ? 'Sred.' : 'Niz.',
    task.status === 'open' ? 'Otkr.' : 
    task.status === 'in_progress' ? 'V rab.' : 'Zav.',
    task.dueDate ? new Date(task.dueDate).toLocaleDateString('ru-RU') : '-'
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Nazvanie', 'Otvetstvennyy', 'Prior.', 'Status', 'Srok']],
    body: tasksData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 8 }
  });

  const fileName = `Tasks_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const generateIncidentsReport = async (incidents: Incident[], period: ReportPeriod = 'all') => {
  const filteredIncidents = filterIncidentsByPeriod(incidents, period);
  const periodLabel = getPeriodLabel(period);
  const doc = new jsPDF();
  await loadFont(doc);

  let yPos = 20;

  doc.setFontSize(18);
  doc.text(`Otchet po incidentam (${periodLabel})`, 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('ru-RU')}`, 20, yPos);
  yPos += 15;

  // Статистика за период
  const total = filteredIncidents.length;
  const overdue = filteredIncidents.filter(i => i.status === 'overdue').length;
  const critical = filteredIncidents.filter(i => i.daysLeft < 0).length;
  const inProgress = filteredIncidents.filter(i => i.status === 'in_progress').length;
  const completed = filteredIncidents.filter(i => i.status === 'completed' || i.status === 'completed_late').length;

  const statsData = [
    ['Vsego incidentov', total.toString()],
    ['Prosrochennykh', overdue.toString()],
    ['Kriticheskikh', critical.toString()],
    ['V rabote', inProgress.toString()],
    ['Ispolnennykh', completed.toString()]
  ];

  doc.autoTable({
    startY: yPos,
    head: [['Pokazatel', 'Znachenie']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68] }
  });

  yPos = doc.lastAutoTable?.finalY || yPos + 40;
  yPos += 10;

  // Таблица инцидентов за период
  const incidentsData = filteredIncidents.map(incident => [
    incident.description.substring(0, 35),
    incident.responsiblePersonnelId?.substring(0, 20) || '-',
    incident.daysLeft < 0 ? `Prosr. ${Math.abs(incident.daysLeft)}d` : `${incident.daysLeft}d`,
    incident.status === 'created' ? 'Sozd.' :
    incident.status === 'in_progress' ? 'V rab.' :
    incident.status === 'awaiting' ? 'Ozhid.' :
    incident.status === 'overdue' ? 'Prosr.' :
    incident.status === 'completed' ? 'Isp.' : 'Isp.op.',
    new Date(incident.createdAt).toLocaleDateString('ru-RU')
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Opisanie', 'Otvetstvennyy', 'Srok', 'Status', 'Data']],
    body: incidentsData,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
    styles: { fontSize: 8 }
  });

  const fileName = `Incidents_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const generateExpertiseReport = async (
  objects: IndustrialObject[],
  organizations: Organization[],
  period: ReportPeriod = 'all'
) => {
  const periodLabel = getPeriodLabel(period);
  const { start } = getDateRangeForPeriod(period);
  
  const filteredObjects = period === 'all' ? objects : objects.filter(obj => {
    if (!obj.expertiseDate) return false;
    return new Date(obj.expertiseDate) >= start;
  });
  
  const doc = new jsPDF();
  await loadFont(doc);

  let yPos = 20;

  doc.setFontSize(18);
  doc.text(`Otchet po ekspertizam EPB (${periodLabel})`, 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('ru-RU')}`, 20, yPos);
  yPos += 15;

  // Фильтруем объекты с экспертизами за период
  const objectsWithExpertise = filteredObjects
    .filter(obj => obj.nextExpertiseDate)
    .map(obj => {
      const dueDate = new Date(obj.nextExpertiseDate!);
      const daysLeft = Math.floor((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const organization = organizations.find(org => org.id === obj.organizationId);
      
      return {
        ...obj,
        daysLeft,
        organizationName: organization?.name || '-'
      };
    })
    .filter(item => item.daysLeft >= -30 && item.daysLeft <= 90)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Статистика
  const overdue = objectsWithExpertise.filter(o => o.daysLeft < 0).length;
  const critical = objectsWithExpertise.filter(o => o.daysLeft >= 0 && o.daysLeft <= 30).length;
  const upcoming = objectsWithExpertise.filter(o => o.daysLeft > 30).length;

  const statsData = [
    ['Prosrocheno', overdue.toString()],
    ['Kritichnye (do 30 dney)', critical.toString()],
    ['Predstoyashchie', upcoming.toString()],
    ['Vsego', objectsWithExpertise.length.toString()]
  ];

  doc.autoTable({
    startY: yPos,
    head: [['Pokazatel', 'Znachenie']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [245, 158, 11] }
  });

  yPos = doc.lastAutoTable?.finalY || yPos + 40;
  yPos += 10;

  // Таблица объектов
  const expertiseData = objectsWithExpertise.map(obj => [
    obj.name.substring(0, 30),
    obj.organizationName.substring(0, 25),
    new Date(obj.nextExpertiseDate!).toLocaleDateString('ru-RU'),
    obj.daysLeft < 0 
      ? `Prosr. ${Math.abs(obj.daysLeft)} d.`
      : `${obj.daysLeft} d.`
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Obekt', 'Organizaciya', 'Data EPB', 'Ostalos']],
    body: expertiseData,
    theme: 'striped',
    headStyles: { fillColor: [245, 158, 11] },
    styles: { fontSize: 8 }
  });

  const fileName = `Expertise_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const generateOrganizationsReport = async (
  organizations: Organization[],
  objects: IndustrialObject[],
  period: ReportPeriod = 'all'
) => {
  const periodLabel = getPeriodLabel(period);
  const doc = new jsPDF();
  await loadFont(doc);

  let yPos = 20;

  doc.setFontSize(18);
  doc.text(`Otchet po organizaciyam (${periodLabel})`, 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('ru-RU')}`, 20, yPos);
  yPos += 15;

  // Статистика
  const total = organizations.length;
  const holdings = organizations.filter(o => o.type === 'holding').length;
  const legalEntities = organizations.filter(o => o.type === 'legal_entity').length;
  const branches = organizations.filter(o => o.type === 'branch').length;

  const statsData = [
    ['Vsego organizaciy', total.toString()],
    ['Kholdingov', holdings.toString()],
    ['Yuridicheskikh lic', legalEntities.toString()],
    ['Filialov', branches.toString()]
  ];

  doc.autoTable({
    startY: yPos,
    head: [['Pokazatel', 'Znachenie']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }
  });

  yPos = doc.lastAutoTable?.finalY || yPos + 40;
  yPos += 10;

  // Таблица организаций
  const orgsData = organizations.map(org => {
    const orgObjects = objects.filter(obj => obj.organizationId === org.id);
    const activeObjects = orgObjects.filter(obj => obj.status === 'active');
    
    return [
      org.name.substring(0, 35),
      org.type === 'holding' ? 'Khold.' : 
      org.type === 'legal_entity' ? 'Yur.l.' : 'Fil.',
      org.inn || '-',
      `${activeObjects.length}/${orgObjects.length}`
    ];
  });

  doc.autoTable({
    startY: yPos,
    head: [['Nazvanie', 'Tip', 'INN', 'Obektov']],
    body: orgsData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 }
  });

  const fileName = `Organizations_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};