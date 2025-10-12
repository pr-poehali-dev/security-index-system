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
import { useAttestationStore } from '@/stores/attestationStore';
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
  const { issuedCertificates, syncCertificateToAttestation } = useTrainingCenterStore();
  const { addCertification } = useAttestationStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Award" size={24} />
          Реестр выданных удостоверений
        </CardTitle>
        <CardDescription>
          Список всех удостоверений, выданных учебным центром
        </CardDescription>
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
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
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
    </Card>
  );
}
