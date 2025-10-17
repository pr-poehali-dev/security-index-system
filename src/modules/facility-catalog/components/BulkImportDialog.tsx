import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { FacilityComponent, ComponentType } from '@/types/facilities';
import * as XLSX from 'xlsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImportRow {
  полное_наименование: string;
  краткое_наименование?: string;
  тип: string;
  тип_ту_зс?: string;
  марка?: string;
  производитель?: string;
  дата_изготовления?: string;
  дата_монтажа?: string;
  дата_ввода?: string;
  срок_эксплуатации?: number;
  техническое_состояние?: string;
  статус_оборудования?: string;
  регистрация_ртн?: string;
  рег_номер_внутренний?: string;
  рег_номер_ртн?: string;
  номер_технологический?: string;
  номер_заводской?: string;
}

const TECHNICAL_STATUS_MAP: Record<string, string> = {
  'действующее': 'operating',
  'требуется ремонт': 'needs_repair',
  'требуется замена': 'needs_replacement',
  'выведено из эксплуатации': 'decommissioned',
};

const EQUIPMENT_STATUS_MAP: Record<string, string> = {
  'в работе': 'working',
  'в ремонте': 'in_repair',
  'выведено из эксплуатации': 'decommissioned',
};

export default function BulkImportDialog({
  open,
  onOpenChange,
}: BulkImportDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { addComponent, getFacilitiesByTenant } = useFacilitiesStore();
  const facilities = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];
  const opoFacilities = facilities.filter(f => f.type === 'opo');
  const { toast } = useToast();

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<ImportRow[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<ImportRow>(firstSheet);
        
        setPreviewData(jsonData.slice(0, 5));
      } catch (error) {
        toast({
          title: 'Ошибка чтения файла',
          description: 'Не удалось прочитать Excel файл',
          variant: 'destructive',
        });
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = async () => {
    if (!file || !user?.tenantId || !selectedFacilityId) {
      toast({
        title: 'Ошибка',
        description: 'Выберите ОПО и файл для импорта',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<ImportRow>(firstSheet);

          const facility = facilities.find(f => f.id === selectedFacilityId);
          if (!facility) {
            throw new Error('ОПО не найден');
          }

          let successCount = 0;
          let errorCount = 0;

          jsonData.forEach((row) => {
            try {
              if (!row.полное_наименование || !row.тип) {
                errorCount++;
                return;
              }

              const componentType: ComponentType = 
                row.тип.toLowerCase().includes('ту') || row.тип.toLowerCase().includes('техническое') 
                  ? 'technical_device' 
                  : 'building_structure';

              const component: Omit<FacilityComponent, 'id' | 'createdAt' | 'updatedAt'> = {
                tenantId: user.tenantId!,
                facilityId: selectedFacilityId,
                facilityName: facility.fullName,
                type: componentType,
                fullName: row.полное_наименование,
                shortName: row.краткое_наименование || undefined,
                deviceType: row.тип_ту_зс,
                brand: row.марка,
                manufacturer: row.производитель,
                manufactureDate: row.дата_изготовления,
                installationDate: row.дата_монтажа,
                commissioningDate: row.дата_ввода,
                standardOperatingPeriod: row.срок_эксплуатации,
                technicalStatus: TECHNICAL_STATUS_MAP[row.техническое_состояние?.toLowerCase() || ''] || 'operating',
                equipmentStatus: EQUIPMENT_STATUS_MAP[row.статус_оборудования?.toLowerCase() || ''] || 'working',
                registeredInRostechnadzor: row.регистрация_ртн?.toLowerCase() === 'да' || row.регистрация_ртн?.toLowerCase() === 'yes',
                internalRegistrationNumber: row.рег_номер_внутренний,
                rostechnadzorRegistrationNumber: row.рег_номер_ртн,
                technologicalNumber: row.номер_технологический,
                factoryNumber: row.номер_заводской,
                customDocuments: [],
                expertiseRecords: [],
                maintenanceRecords: [],
                constructionData: [],
                technicalParameters: [],
                accidents: [],
                rostechnadzorDirectives: [],
              };

              addComponent(component);
              successCount++;
            } catch (error) {
              console.error('Ошибка импорта строки:', error);
              errorCount++;
            }
          });

          toast({
            title: 'Импорт завершен',
            description: `Успешно: ${successCount}, Ошибок: ${errorCount}`,
          });

          setImporting(false);
          onOpenChange(false);
          setFile(null);
          setPreviewData([]);
          setSelectedFacilityId('');
        } catch (error) {
          console.error('Ошибка импорта:', error);
          toast({
            title: 'Ошибка импорта',
            description: 'Не удалось импортировать данные',
            variant: 'destructive',
          });
          setImporting(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Ошибка импорта:', error);
      toast({
        title: 'Ошибка импорта',
        description: 'Не удалось импортировать данные',
        variant: 'destructive',
      });
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        полное_наименование: 'Компрессор ГПА-Ц-16',
        краткое_наименование: 'Компрессор ГПА',
        тип: 'ТУ',
        тип_ту_зс: 'Компрессор центробежный',
        марка: 'ГПА-Ц-16',
        производитель: 'ОАО "Сумское НПО"',
        дата_изготовления: '2020-01-15',
        дата_монтажа: '2020-05-10',
        дата_ввода: '2020-06-01',
        срок_эксплуатации: 25,
        техническое_состояние: 'действующее',
        статус_оборудования: 'в работе',
        регистрация_ртн: 'да',
        рег_номер_внутренний: 'ОБ-КС-001',
        рег_номер_ртн: 'РТН-77-КС-00456',
        номер_технологический: 'ТХ-001',
        номер_заводской: 'К-2024-0456',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Шаблон');
    XLSX.writeFile(wb, 'Шаблон_импорта_ТУ_ЗС.xlsx');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Массовый импорт ТУ и ЗС</DialogTitle>
          <DialogDescription>
            Загрузите Excel файл с данными о технических устройствах и зданиях/сооружениях
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Icon name="Info" size={16} />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Инструкция по импорту:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Скачайте шаблон Excel файла</li>
                  <li>Заполните данные согласно шаблону</li>
                  <li>Выберите ОПО для привязки компонентов</li>
                  <li>Загрузите файл и нажмите "Импортировать"</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          <Button onClick={downloadTemplate} variant="outline" className="w-full">
            <Icon name="Download" size={16} className="mr-2" />
            Скачать шаблон Excel
          </Button>

          <div className="space-y-2">
            <Label htmlFor="facility">Выберите ОПО *</Label>
            <Select value={selectedFacilityId} onValueChange={setSelectedFacilityId}>
              <SelectTrigger id="facility">
                <SelectValue placeholder="Выберите объект" />
              </SelectTrigger>
              <SelectContent>
                {opoFacilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Выберите файл Excel *</Label>
            <div className="flex gap-2">
              <input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Выбран файл: {file.name}
              </p>
            )}
          </div>

          {previewData.length > 0 && (
            <div className="space-y-2">
              <Label>Предпросмотр (первые 5 строк):</Label>
              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Наименование</th>
                      <th className="p-2 text-left">Тип</th>
                      <th className="p-2 text-left">Марка</th>
                      <th className="p-2 text-left">Производитель</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{row.полное_наименование}</td>
                        <td className="p-2">{row.тип}</td>
                        <td className="p-2">{row.марка || '—'}</td>
                        <td className="p-2">{row.производитель || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setFile(null);
                setPreviewData([]);
                setSelectedFacilityId('');
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || !selectedFacilityId || importing}
            >
              {importing ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Импорт...
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
