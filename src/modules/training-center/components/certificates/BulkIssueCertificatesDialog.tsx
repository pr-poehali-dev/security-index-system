import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useTrainingCenterStore, type IssuedCertificate } from '@/stores/trainingCenterStore';
import { useDpoQualificationStore } from '@/stores/dpoQualificationStore';

interface BulkIssueCertificatesDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ParsedRow {
  personnelName: string;
  certificateNumber: string;
  protocolNumber: string;
  protocolDate: string;
  issueDate: string;
  expiryDate: string;
  area: string;
  valid: boolean;
  errors: string[];
}

export default function BulkIssueCertificatesDialog({ open, onClose }: BulkIssueCertificatesDialogProps) {
  const { addIssuedCertificate, syncCertificateToAttestation } = useTrainingCenterStore();
  const { addQualification } = useDpoQualificationStore();
  
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  
  const [programId, setProgramId] = useState('');
  const [programName, setProgramName] = useState('');
  const [category, setCategory] = useState<'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology'>('industrial_safety');
  const [clientTenantId, setClientTenantId] = useState('tenant-1');
  const [autoSync, setAutoSync] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const rows: ParsedRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';').map(v => v.trim());
      
      if (values.length < 7) continue;
      
      const row: ParsedRow = {
        personnelName: values[0] || '',
        certificateNumber: values[1] || '',
        protocolNumber: values[2] || '',
        protocolDate: values[3] || '',
        issueDate: values[4] || '',
        expiryDate: values[5] || '',
        area: values[6] || '',
        valid: true,
        errors: []
      };
      
      if (!row.personnelName) row.errors.push('Не указано ФИО');
      if (!row.certificateNumber) row.errors.push('Не указан номер удостоверения');
      if (!row.protocolNumber) row.errors.push('Не указан номер протокола');
      if (!row.issueDate) row.errors.push('Не указана дата выдачи');
      if (!row.expiryDate) row.errors.push('Не указан срок действия');
      
      row.valid = row.errors.length === 0;
      rows.push(row);
    }
    
    return rows;
  };

  const handleParseFile = async () => {
    if (!file) return;
    
    const text = await file.text();
    const parsed = parseCSV(text);
    setParsedData(parsed);
    
    const validIndices = new Set(
      parsed.map((row, idx) => row.valid ? idx : -1).filter(idx => idx !== -1)
    );
    setSelectedRows(validIndices);
    
    setStep('preview');
  };

  const handleBulkIssue = async () => {
    if (!programId || !programName) {
      alert('Укажите программу обучения');
      return;
    }
    
    setProcessing(true);
    let success = 0;
    let failed = 0;
    
    for (const idx of selectedRows) {
      const row = parsedData[idx];
      if (!row.valid) {
        failed++;
        continue;
      }
      
      try {
        const newCert: Omit<IssuedCertificate, 'id' | 'createdAt' | 'updatedAt'> = {
          trainingCenterId: 'external-org-1',
          clientTenantId,
          personnelId: `personnel-bulk-${Date.now()}-${idx}`,
          personnelName: row.personnelName,
          programId,
          programName,
          certificateNumber: row.certificateNumber,
          protocolNumber: row.protocolNumber,
          protocolDate: row.protocolDate,
          issueDate: row.issueDate,
          expiryDate: row.expiryDate,
          category,
          area: row.area,
          status: autoSync ? 'synced' : 'issued',
          issuedBy: 'Комиссия АНО ДПО "Учебный центр"'
        };
        
        const issued = addIssuedCertificate(newCert);
        
        if (autoSync) {
          addQualification({
            personnelId: issued.personnelId,
            tenantId: clientTenantId,
            category: category as any,
            programName: programName,
            trainingOrganizationId: 'external-org-1',
            trainingOrganizationName: 'АНО ДПО "Учебный центр"',
            certificateNumber: issued.certificateNumber,
            issueDate: issued.issueDate,
            expiryDate: issued.expiryDate,
            duration: 72
          });
        }
        
        success++;
      } catch (error) {
        console.error('Error issuing certificate:', error);
        failed++;
      }
    }
    
    setResult({ success, failed });
    setProcessing(false);
    setStep('result');
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setParsedData([]);
    setSelectedRows(new Set());
    setResult({ success: 0, failed: 0 });
    setProgramId('');
    setProgramName('');
    setAutoSync(true);
    onClose();
  };

  const toggleRow = (idx: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === parsedData.filter(r => r.valid).length) {
      setSelectedRows(new Set());
    } else {
      const allValid = new Set(
        parsedData.map((row, idx) => row.valid ? idx : -1).filter(idx => idx !== -1)
      );
      setSelectedRows(allValid);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Upload" size={24} />
            Массовая выгрузка удостоверений
          </DialogTitle>
          <DialogDescription>
            Загрузите CSV файл с данными удостоверений для массового добавления
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <Alert>
              <Icon name="Info" size={16} />
              <AlertDescription>
                <p className="font-medium mb-2">Формат CSV файла (разделитель - точка с запятой):</p>
                <code className="text-xs bg-muted px-2 py-1 rounded block">
                  ФИО;Номер удостоверения;Номер протокола;Дата протокола;Дата выдачи;Срок действия;Область аттестации
                </code>
                <p className="text-xs mt-2">Пример: Иванов И.И.;УД-2024-001;ПБ-123/2024;2024-01-15;2024-01-15;2029-01-15;А.1 Основы промбезопасности</p>
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="program-id">ID программы</Label>
                <Input
                  id="program-id"
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  placeholder="program-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="program-name">Название программы</Label>
                <Input
                  id="program-name"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="Промышленная безопасность А.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="industrial_safety">Промышленная безопасность</SelectItem>
                    <SelectItem value="energy_safety">Энергобезопасность</SelectItem>
                    <SelectItem value="labor_safety">Охрана труда</SelectItem>
                    <SelectItem value="ecology">Экология</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenant">Организация-заказчик</Label>
                <Input
                  id="tenant"
                  value={clientTenantId}
                  onChange={(e) => setClientTenantId(e.target.value)}
                  placeholder="tenant-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-sync"
                  checked={autoSync}
                  onCheckedChange={(checked) => setAutoSync(checked as boolean)}
                />
                <Label htmlFor="auto-sync" className="text-sm font-normal cursor-pointer">
                  Автоматически синхронизировать с системой учета аттестаций
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">CSV файл</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Найдено записей: {parsedData.length}</p>
                <p className="text-sm text-muted-foreground">
                  Валидных: {parsedData.filter(r => r.valid).length} | 
                  Ошибок: {parsedData.filter(r => !r.valid).length} | 
                  Выбрано: {selectedRows.size}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {selectedRows.size === parsedData.filter(r => r.valid).length ? 'Снять все' : 'Выбрать все валидные'}
              </Button>
            </div>

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left w-8"></th>
                    <th className="p-2 text-left">ФИО</th>
                    <th className="p-2 text-left">Удостоверение</th>
                    <th className="p-2 text-left">Протокол</th>
                    <th className="p-2 text-left">Даты</th>
                    <th className="p-2 text-left">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, idx) => (
                    <tr key={idx} className={!row.valid ? 'bg-destructive/10' : ''}>
                      <td className="p-2">
                        {row.valid && (
                          <Checkbox
                            checked={selectedRows.has(idx)}
                            onCheckedChange={() => toggleRow(idx)}
                          />
                        )}
                      </td>
                      <td className="p-2">{row.personnelName}</td>
                      <td className="p-2 font-mono text-xs">{row.certificateNumber}</td>
                      <td className="p-2">
                        <div className="text-xs">
                          <div>{row.protocolNumber}</div>
                          <div className="text-muted-foreground">{row.protocolDate}</div>
                        </div>
                      </td>
                      <td className="p-2 text-xs">
                        <div>{row.issueDate} — {row.expiryDate}</div>
                      </td>
                      <td className="p-2">
                        {row.valid ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">Готово</Badge>
                        ) : (
                          <div>
                            <Badge variant="destructive" className="mb-1">Ошибка</Badge>
                            <ul className="text-xs text-destructive">
                              {row.errors.map((err, i) => <li key={i}>• {err}</li>)}
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-4">
            <Alert className={result.failed === 0 ? 'border-green-500 bg-green-50' : ''}>
              <Icon name={result.failed === 0 ? 'CheckCircle' : 'AlertCircle'} size={20} />
              <AlertDescription>
                <p className="font-medium text-lg mb-2">Загрузка завершена</p>
                <div className="space-y-1">
                  <p>✅ Успешно загружено: <span className="font-bold">{result.success}</span></p>
                  {result.failed > 0 && (
                    <p>❌ Ошибок: <span className="font-bold">{result.failed}</span></p>
                  )}
                  {autoSync && result.success > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Удостоверения автоматически синхронизированы с системой учета аттестаций
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button onClick={handleParseFile} disabled={!file || !programId || !programName}>
                <Icon name="FileSearch" size={16} className="mr-2" />
                Проверить файл
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Назад
              </Button>
              <Button onClick={handleBulkIssue} disabled={selectedRows.size === 0 || processing}>
                {processing ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={16} className="mr-2" />
                    Загрузить {selectedRows.size} удостоверений
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'result' && (
            <Button onClick={handleClose}>
              Закрыть
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}