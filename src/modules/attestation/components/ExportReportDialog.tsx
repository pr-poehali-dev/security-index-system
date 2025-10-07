import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  organization: string;
  certifications: Array<{
    id: string;
    category: string;
    area: string;
    issueDate: string;
    expiryDate: string;
    protocolNumber?: string;
    protocolDate?: string;
    verified?: boolean;
    verifiedDate?: string;
    status: 'valid' | 'expiring_soon' | 'expired';
    daysLeft: number;
  }>;
}

interface ExportReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
}

interface ExportFilters {
  department: string;
  status: string;
  category: string;
  dateFrom: string;
  dateTo: string;
  includeExpired: boolean;
  includeExpiring: boolean;
  includeValid: boolean;
  includeVerifiedOnly: boolean;
}

export default function ExportReportDialog({ open, onOpenChange, employees }: ExportReportDialogProps) {
  const { toast } = useToast();
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [reportType, setReportType] = useState<'full' | 'summary' | 'expiring'>('full');
  const [filters, setFilters] = useState<ExportFilters>({
    department: 'all',
    status: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    includeExpired: true,
    includeExpiring: true,
    includeValid: true,
    includeVerifiedOnly: false,
  });

  const departments = Array.from(new Set(employees.map(e => e.department)));
  const categories = Array.from(new Set(employees.flatMap(e => e.certifications.map(c => c.category))));

  const applyFilters = (data: Employee[]) => {
    return data.map(emp => ({
      ...emp,
      certifications: emp.certifications.filter(cert => {
        const matchesDepartment = filters.department === 'all' || emp.department === filters.department;
        const matchesCategory = filters.category === 'all' || cert.category === filters.category;
        const matchesStatus = 
          (filters.includeExpired && cert.status === 'expired') ||
          (filters.includeExpiring && cert.status === 'expiring_soon') ||
          (filters.includeValid && cert.status === 'valid');
        const matchesVerified = !filters.includeVerifiedOnly || cert.verified;
        
        let matchesDateRange = true;
        if (filters.dateFrom) {
          matchesDateRange = matchesDateRange && new Date(cert.expiryDate) >= new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          matchesDateRange = matchesDateRange && new Date(cert.expiryDate) <= new Date(filters.dateTo);
        }

        return matchesDepartment && matchesCategory && matchesStatus && matchesVerified && matchesDateRange;
      })
    })).filter(emp => emp.certifications.length > 0);
  };

  const generatePDF = () => {
    const filteredData = applyFilters(employees);
    
    if (filteredData.length === 0) {
      toast({
        title: "Нет данных",
        description: "По выбранным фильтрам не найдено данных для экспорта",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    
    doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    doc.setFontSize(16);
    doc.text('Отчёт по аттестациям персонала', 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`, 14, 22);
    
    if (reportType === 'summary') {
      const summary = {
        total: filteredData.reduce((acc, emp) => acc + emp.certifications.length, 0),
        expired: filteredData.reduce((acc, emp) => acc + emp.certifications.filter(c => c.status === 'expired').length, 0),
        expiring: filteredData.reduce((acc, emp) => acc + emp.certifications.filter(c => c.status === 'expiring_soon').length, 0),
        valid: filteredData.reduce((acc, emp) => acc + emp.certifications.filter(c => c.status === 'valid').length, 0),
      };

      autoTable(doc, {
        startY: 28,
        head: [['Показатель', 'Значение']],
        body: [
          ['Всего аттестаций', summary.total],
          ['Действующих', summary.valid],
          ['Истекает в ближайшее время', summary.expiring],
          ['Просрочено', summary.expired],
          ['Процент соответствия', `${Math.round((summary.valid / summary.total) * 100)}%`],
        ],
      });
    } else {
      const tableData = filteredData.flatMap(emp =>
        emp.certifications.map(cert => [
          emp.name,
          emp.department,
          cert.category,
          cert.area,
          new Date(cert.expiryDate).toLocaleDateString('ru-RU'),
          cert.status === 'valid' ? 'Действует' : cert.status === 'expiring_soon' ? 'Истекает' : 'Просрочен',
          cert.verified ? 'Да' : 'Нет',
        ])
      );

      autoTable(doc, {
        startY: 28,
        head: [['ФИО', 'Подразделение', 'Категория', 'Область аттестации', 'Срок действия', 'Статус', 'Верифицирован']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    }

    doc.save(`attestation_report_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Отчёт сформирован",
      description: "PDF файл успешно загружен",
    });
    
    onOpenChange(false);
  };

  const generateExcel = () => {
    const filteredData = applyFilters(employees);
    
    if (filteredData.length === 0) {
      toast({
        title: "Нет данных",
        description: "По выбранным фильтрам не найдено данных для экспорта",
        variant: "destructive",
      });
      return;
    }

    const workbook = XLSX.utils.book_new();

    if (reportType === 'summary') {
      const summary = {
        total: filteredData.reduce((acc, emp) => acc + emp.certifications.length, 0),
        expired: filteredData.reduce((acc, emp) => acc + emp.certifications.filter(c => c.status === 'expired').length, 0),
        expiring: filteredData.reduce((acc, emp) => acc + emp.certifications.filter(c => c.status === 'expiring_soon').length, 0),
        valid: filteredData.reduce((acc, emp) => acc + emp.certifications.filter(c => c.status === 'valid').length, 0),
      };

      const summaryData = [
        ['Отчёт по аттестациям персонала'],
        ['Дата формирования:', new Date().toLocaleDateString('ru-RU')],
        [],
        ['Показатель', 'Значение'],
        ['Всего аттестаций', summary.total],
        ['Действующих', summary.valid],
        ['Истекает в ближайшее время', summary.expiring],
        ['Просрочено', summary.expired],
        ['Процент соответствия', `${Math.round((summary.valid / summary.total) * 100)}%`],
      ];

      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, ws, 'Сводка');
    } else {
      const detailData = [
        ['ФИО', 'Должность', 'Подразделение', 'Организация', 'Категория', 'Область аттестации', 'Дата выдачи', 'Срок действия', 'Номер протокола', 'Дата протокола', 'Статус', 'Верифицирован', 'Осталось дней']
      ];

      filteredData.forEach(emp => {
        emp.certifications.forEach(cert => {
          detailData.push([
            emp.name,
            emp.position,
            emp.department,
            emp.organization,
            cert.category,
            cert.area,
            new Date(cert.issueDate).toLocaleDateString('ru-RU'),
            new Date(cert.expiryDate).toLocaleDateString('ru-RU'),
            cert.protocolNumber || '',
            cert.protocolDate ? new Date(cert.protocolDate).toLocaleDateString('ru-RU') : '',
            cert.status === 'valid' ? 'Действует' : cert.status === 'expiring_soon' ? 'Истекает' : 'Просрочен',
            cert.verified ? 'Да' : 'Нет',
            cert.daysLeft,
          ]);
        });
      });

      const ws = XLSX.utils.aoa_to_sheet(detailData);
      
      ws['!cols'] = [
        { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, 
        { wch: 25 }, { wch: 35 }, { wch: 12 }, { wch: 12 },
        { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
      ];

      XLSX.utils.book_append_sheet(workbook, ws, 'Детализация');
    }

    XLSX.writeFile(workbook, `attestation_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Отчёт сформирован",
      description: "Excel файл успешно загружен",
    });
    
    onOpenChange(false);
  };

  const handleExport = () => {
    if (format === 'pdf') {
      generatePDF();
    } else {
      generateExcel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Экспорт отчёта по аттестациям</DialogTitle>
          <DialogDescription>
            Настройте параметры отчёта и выберите формат экспорта
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Формат файла</Label>
              <Select value={format} onValueChange={(value: 'pdf' | 'excel') => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <Icon name="FileText" size={16} />
                      PDF документ
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <Icon name="Table" size={16} />
                      Excel таблица
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Тип отчёта</Label>
              <Select value={reportType} onValueChange={(value: 'full' | 'summary' | 'expiring') => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Полный отчёт</SelectItem>
                  <SelectItem value="summary">Сводный отчёт</SelectItem>
                  <SelectItem value="expiring">Истекающие аттестации</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Фильтры данных</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Подразделение</Label>
                <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все подразделения</SelectItem>
                    {departments.map(dep => (
                      <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Категория аттестации</Label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Срок действия от</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Срок действия до</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Статус аттестаций</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-valid"
                    checked={filters.includeValid}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includeValid: checked as boolean }))}
                  />
                  <label htmlFor="include-valid" className="text-sm cursor-pointer">
                    Действующие
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-expiring"
                    checked={filters.includeExpiring}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includeExpiring: checked as boolean }))}
                  />
                  <label htmlFor="include-expiring" className="text-sm cursor-pointer">
                    Истекающие
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-expired"
                    checked={filters.includeExpired}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includeExpired: checked as boolean }))}
                  />
                  <label htmlFor="include-expired" className="text-sm cursor-pointer">
                    Просроченные
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified-only"
                    checked={filters.includeVerifiedOnly}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includeVerifiedOnly: checked as boolean }))}
                  />
                  <label htmlFor="verified-only" className="text-sm cursor-pointer">
                    Только верифицированные
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Info" size={16} />
              <span>
                Будет экспортировано {applyFilters(employees).reduce((acc, emp) => acc + emp.certifications.length, 0)} записей
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Icon name="Download" size={16} />
            Экспортировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
