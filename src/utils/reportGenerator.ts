import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Task } from '@/types/tasks';
import type { Incident } from '@/types/incidents';
import type { IndustrialObject, Organization } from '@/types/catalog';

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
}) => {
  const doc = new jsPDF();
  await loadFont(doc);
  
  let yPos = 20;

  // Заголовок
  doc.setFontSize(18);
  doc.text('Otchet po sisteme', 20, yPos);
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

  // Критические задачи
  if (data.tasks.length > 0) {
    doc.setFontSize(14);
    doc.text('Kriticheskie zadachi', 20, yPos);
    yPos += 10;

    const tasksData = data.tasks.slice(0, 10).map(task => [
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

export const generateTasksReport = async (tasks: Task[]) => {
  const doc = new jsPDF();
  await loadFont(doc);

  let yPos = 20;

  doc.setFontSize(18);
  doc.text('Otchet po zadacham', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('ru-RU')}`, 20, yPos);
  yPos += 15;

  // Статистика
  const total = tasks.length;
  const open = tasks.filter(t => t.status === 'open').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const critical = tasks.filter(t => t.priority === 'critical').length;

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

  // Таблица задач
  const tasksData = tasks.map(task => [
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

export const generateIncidentsReport = async (incidents: Incident[]) => {
  const doc = new jsPDF();
  await loadFont(doc);

  let yPos = 20;

  doc.setFontSize(18);
  doc.text('Otchet po incidentam', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('ru-RU')}`, 20, yPos);
  yPos += 15;

  // Статистика
  const total = incidents.length;
  const critical = incidents.filter(i => i.priority === 'critical').length;
  const high = incidents.filter(i => i.priority === 'high').length;
  const open = incidents.filter(i => i.status === 'open').length;
  const resolved = incidents.filter(i => i.status === 'resolved').length;

  const statsData = [
    ['Vsego incidentov', total.toString()],
    ['Kriticheskikh', critical.toString()],
    ['Vysokogo prioriteta', high.toString()],
    ['Otkrytykh', open.toString()],
    ['Reshennykh', resolved.toString()]
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

  // Таблица инцидентов
  const incidentsData = incidents.map(incident => [
    incident.title.substring(0, 35),
    incident.assignedToName?.substring(0, 20) || '-',
    incident.priority === 'critical' ? 'Krit.' : 
    incident.priority === 'high' ? 'Vys.' : 
    incident.priority === 'medium' ? 'Sred.' : 'Niz.',
    incident.status === 'open' ? 'Otkr.' : 
    incident.status === 'in_progress' ? 'V rab.' : 'Resh.',
    new Date(incident.createdAt).toLocaleDateString('ru-RU')
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Nazvanie', 'Otvetstvennyy', 'Prior.', 'Status', 'Data']],
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
  organizations: Organization[]
) => {
  const doc = new jsPDF();
  await loadFont(doc);

  let yPos = 20;

  doc.setFontSize(18);
  doc.text('Otchet po ekspertizam EPB', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('ru-RU')}`, 20, yPos);
  yPos += 15;

  // Фильтруем объекты с экспертизами
  const objectsWithExpertise = objects
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
  objects: IndustrialObject[]
) => {
  const doc = new jsPDF();
  await loadFont(doc);

  let yPos = 20;

  doc.setFontSize(18);
  doc.text('Otchet po organizaciyam', 20, yPos);
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
