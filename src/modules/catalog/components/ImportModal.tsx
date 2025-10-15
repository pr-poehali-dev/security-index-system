import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useCatalogStore } from '@/stores/catalogStore';
import type { IndustrialObject } from '@/types/catalog';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImportResult {
  success: number;
  errors: string[];
  warnings: string[];
}

export default function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { addObject } = useCatalogStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const errors: string[] = [];
    const warnings: string[] = [];
    let success = 0;

    try {
      const text = await file.text();
      const data = file.name.endsWith('.json') ? JSON.parse(text) : parseCSV(text);

      if (!Array.isArray(data)) {
        errors.push('Неверный формат файла. Ожидается массив объектов.');
        setResult({ success: 0, errors, warnings });
        return;
      }

      data.forEach((item, index) => {
        try {
          if (!item.name || !item.registrationNumber || !item.organizationId) {
            errors.push(`Строка ${index + 1}: отсутствуют обязательные поля (name, registrationNumber, organizationId)`);
            return;
          }

          const objectData: any = {
            tenantId: 'tenant-1',
            name: item.name,
            registrationNumber: item.registrationNumber,
            organizationId: item.organizationId,
            type: item.type || 'opo',
            status: item.status || 'active',
            location: {
              address: item.address || item['location.address'] || ''
            },
            responsiblePerson: item.responsiblePerson || '',
            commissioningDate: item.commissioningDate || new Date().toISOString().split('T')[0],
          };

          if (item.category) objectData.category = item.category;
          if (item.hazardClass) objectData.hazardClass = item.hazardClass;
          if (item.description) objectData.description = item.description;
          if (item.typicalNameId) objectData.typicalNameId = item.typicalNameId;
          if (item.industryCode) objectData.industryCode = item.industryCode;
          if (item.ownerId) objectData.ownerId = item.ownerId;

          if (item.region || item.city || item.street || item.building) {
            objectData.detailedAddress = {
              postalCode: item.postalCode || '',
              region: item.region || '',
              city: item.city || '',
              street: item.street || '',
              building: item.building || '',
              oktmo: item.oktmo || '',
              fullAddress: `${item.postalCode ? item.postalCode + ', ' : ''}${item.region || ''}, ${item.city || ''}, ${item.street || ''}, ${item.building || ''}`
            };
          }

          if (item.dangerSigns) {
            objectData.dangerSigns = typeof item.dangerSigns === 'string' 
              ? item.dangerSigns.split(';').filter(Boolean)
              : item.dangerSigns;
          }

          if (item.classifications) {
            objectData.classifications = typeof item.classifications === 'string'
              ? item.classifications.split(';').filter(Boolean)
              : item.classifications;
          }

          if (item.licensedActivities) {
            objectData.licensedActivities = typeof item.licensedActivities === 'string'
              ? item.licensedActivities.split(';').filter(Boolean)
              : item.licensedActivities;
          }

          addObject(objectData);
          success++;
        } catch (error) {
          errors.push(`Строка ${index + 1}: ${error instanceof Error ? error.message : 'неизвестная ошибка'}`);
        }
      });

      setResult({ success, errors, warnings });
    } catch (error) {
      errors.push(`Ошибка чтения файла: ${error instanceof Error ? error.message : 'неизвестная ошибка'}`);
      setResult({ success: 0, errors, warnings });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const template = [
      'name,registrationNumber,organizationId,type,status,address,category,hazardClass,responsiblePerson,commissioningDate,region,city,street,building,oktmo,typicalNameId,industryCode,ownerId,dangerSigns,classifications,licensedActivities,description',
      'Котельная №1,А-12345,org-1,opo,active,"г. Москва, ул. Примерная, д. 1",Котельная,III,Иванов И.И.,2020-01-15,Москва,Москва,ул. Примерная,д. 1,12345678,typical-1,01.10.1,,sign-1;sign-2,class-1,activity-1,Описание объекта'
    ].join('\n');

    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_opo_import.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Импорт объектов</DialogTitle>
          <DialogDescription>
            Загрузите файл CSV или JSON с данными объектов
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Icon name="Info" size={16} />
            <AlertDescription>
              Поддерживаемые форматы: CSV, JSON. 
              <Button variant="link" className="h-auto p-0 ml-1" onClick={downloadTemplate}>
                Скачать шаблон CSV
              </Button>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Выберите файл</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              disabled={importing}
            />
            {file && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Icon name="FileText" size={16} />
                {file.name} ({(file.size / 1024).toFixed(1)} КБ)
              </p>
            )}
          </div>

          {result && (
            <div className="space-y-3">
              {result.success > 0 && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <Icon name="CheckCircle" size={16} className="text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-300">
                    Успешно импортировано: {result.success} объект(ов)
                  </AlertDescription>
                </Alert>
              )}

              {result.errors.length > 0 && (
                <Alert variant="destructive">
                  <Icon name="AlertCircle" size={16} />
                  <AlertDescription>
                    <div className="font-semibold mb-1">Ошибки ({result.errors.length}):</div>
                    <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {result.warnings.length > 0 && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                  <Icon name="AlertTriangle" size={16} className="text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-300">
                    <div className="font-semibold mb-1">Предупреждения ({result.warnings.length}):</div>
                    <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                      {result.warnings.map((warning, i) => (
                        <li key={i}>• {warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Закрыть
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || importing}
            >
              {importing ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Импортируется...
                </>
              ) : (
                <>
                  <Icon name="Upload" size={16} className="mr-2" />
                  Импортировать
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
