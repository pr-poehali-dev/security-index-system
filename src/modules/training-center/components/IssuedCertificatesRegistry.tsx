import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { useTrainingCenterStore } from '@/stores/trainingCenterStore';
import { useCertificationStore } from '@/stores/certificationStore';
import BulkIssueCertificatesDialog from './BulkIssueCertificatesDialog';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const statusLabels = {
  issued: 'Выдано',
  delivered: 'Передано клиенту',
  synced: 'Синхронизировано'
};

const statusColors = {
  issued: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  synced: 'bg-emerald-100 text-emerald-800'
};

const categoryLabels = {
  industrial_safety: 'Промбезопасность',
  energy_safety: 'Энергобезопасность',
  labor_safety: 'Охрана труда',
  ecology: 'Экология'
};

export default function IssuedCertificatesRegistry() {
  const { issuedCertificates, syncCertificateToAttestation, trainingPrograms } = useTrainingCenterStore();
  const { addCertification } = useCertificationStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  const filteredCertificates = issuedCertificates.filter((cert) => {
    const matchesSearch = 
      cert.personnelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.programName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || cert.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSync = (certificateId: string) => {
    const attestationCert = syncCertificateToAttestation(certificateId);
    if (attestationCert) {
      addCertification(attestationCert);
      alert('Удостоверение успешно синхронизировано в систему учета аттестаций!');
    }
  };

  const handleExport = () => {
    // Подготовка данных для экспорта
    const dataToExport = filteredCertificates.map(cert => {
      const program = trainingPrograms.find(p => p.id === cert.programId);
      return {
        'ФИО': cert.personnelName,
        'Организация': cert.organizationName || 'Не указана',
        'ИНН организации': cert.organizationInn || '',
        'Номер удостоверения': cert.certificateNumber,
        'Программа обучения': cert.programName,
        'Категория': categoryLabels[cert.category as keyof typeof categoryLabels] || cert.category,
        'Номер протокола': cert.protocolNumber,
        'Дата протокола': format(new Date(cert.protocolDate), 'dd.MM.yyyy', { locale: ru }),
        'Дата выдачи': format(new Date(cert.issueDate), 'dd.MM.yyyy', { locale: ru }),
        'Срок действия': format(new Date(cert.expiryDate), 'dd.MM.yyyy', { locale: ru }),
        'Область аттестации': cert.area || '',
        'Статус': statusLabels[cert.status as keyof typeof statusLabels] || cert.status
      };
    });

    // Формирование CSV
    const headers = Object.keys(dataToExport[0] || {});
    const csvContent = [
      headers.join(';'),
      ...dataToExport.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row] || '';
          // Экранируем точки с запятой и кавычки
          return typeof value === 'string' && (value.includes(';') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(';')
      )
    ].join('\n');

    // Скачивание файла
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `удостоверения_реестр_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Award" size={24} />
              Реестр выданных удостоверений
            </CardTitle>
            <CardDescription>
              Список всех удостоверений, выданных учебным центром
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Icon name="Download" size={18} />
              Экспорт
            </Button>
            <Button onClick={() => setBulkDialogOpen(true)} className="gap-2">
              <Icon name="Upload" size={18} />
              Массовая загрузка
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Поиск по ФИО, номеру удостоверения или программе..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="issued">Выдано</SelectItem>
              <SelectItem value="delivered">Передано</SelectItem>
              <SelectItem value="synced">Синхронизировано</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              <SelectItem value="industrial_safety">Промбезопасность</SelectItem>
              <SelectItem value="energy_safety">Энергобезопасность</SelectItem>
              <SelectItem value="labor_safety">Охрана труда</SelectItem>
              <SelectItem value="ecology">Экология</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата выдачи</TableHead>
                <TableHead>ФИО обучающегося</TableHead>
                <TableHead>Организация</TableHead>
                <TableHead>Программа</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Номер удостоверения</TableHead>
                <TableHead>Протокол</TableHead>
                <TableHead>Срок действия</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Документы</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    Удостоверения не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(cert.issueDate), 'dd.MM.yyyy', { locale: ru })}
                    </TableCell>
                    <TableCell className="font-medium">{cert.personnelName}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="font-medium truncate">{cert.organizationName || 'Не указана'}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {cert.organizationInn ? `ИНН: ${cert.organizationInn}` : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="font-medium truncate">{cert.programName}</div>
                        <div className="text-xs text-muted-foreground truncate">{cert.area}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[cert.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{cert.certificateNumber}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{cert.protocolNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(cert.protocolDate), 'dd.MM.yyyy', { locale: ru })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(cert.expiryDate), 'dd.MM.yyyy', { locale: ru })}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[cert.status]}>
                        {statusLabels[cert.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {cert.certificateFileUrl && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Icon name="FileText" size={16} />
                          </Button>
                        )}
                        {cert.protocolFileUrl && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Icon name="ScrollText" size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {cert.status !== 'synced' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleSync(cert.id)}
                        >
                          <Icon name="RefreshCw" size={14} />
                          Синхронизировать
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Всего удостоверений: <span className="font-medium">{filteredCertificates.length}</span>
        </div>
      </CardContent>

      <BulkIssueCertificatesDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
      />
    </Card>
  );
}