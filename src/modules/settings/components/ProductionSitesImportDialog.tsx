import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { exportToExcel } from '@/lib/exportUtils';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import type { ProductionSite } from '@/types';

interface ProductionSitesImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImportRow {
  'Организация': string;
  'Название площадки': string;
  'Код': string;
  'Адрес': string;
  'Руководитель': string;
  'Телефон': string;
  'Статус': string;
}

export default function ProductionSitesImportDialog({ open, onOpenChange }: ProductionSitesImportDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { organizations, importProductionSites } = useSettingsStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Организация': 'ООО "Пример"',
        'Название площадки': 'Производственная площадка №1',
        'Код': 'ПП-1',
        'Адрес': 'г. Москва, ул. Промышленная, д. 1',
        'Руководитель': 'Иванов И.И.',
        'Телефон': '+7 (999) 123-45-67',
        'Статус': 'Активна'
      },
      {
        'Организация': 'ООО "Пример"',
        'Название площадки': 'Производственная площадка №2',
        'Код': 'ПП-2',
        'Адрес': 'г. Санкт-Петербург, пр. Невский, д. 100',
        'Руководитель': 'Петров П.П.',
        'Телефон': '+7 (999) 234-56-78',
        'Статус': 'Активна'
      }
    ];

    exportToExcel(templateData, 'Шаблон_производственных_площадок');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsProcessing(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<ImportRow>(worksheet);

      if (jsonData.length === 0) {
        throw new Error('Файл пустой');
      }

      const sitesToImport: Omit<ProductionSite, 'id' | 'createdAt'>[] = [];
      const errors: string[] = [];

      jsonData.forEach((row, index) => {
        const rowNum = index + 2;

        if (!row['Название площадки']?.trim()) {
          errors.push(`Строка ${rowNum}: отсутствует название площадки`);
          return;
        }

        if (!row['Адрес']?.trim()) {
          errors.push(`Строка ${rowNum}: отсутствует адрес`);
          return;
        }

        const orgName = row['Организация']?.trim();
        const org = organizations.find(o => o.name === orgName);
        
        if (!org) {
          errors.push(`Строка ${rowNum}: организация "${orgName}" не найдена`);
          return;
        }

        const status = row['Статус']?.toLowerCase().includes('актив') ? 'active' : 'inactive';

        sitesToImport.push({
          tenantId: user.tenantId!,
          organizationId: org.id,
          name: row['Название площадки'].trim(),
          code: row['Код']?.trim(),
          address: row['Адрес'].trim(),
          head: row['Руководитель']?.trim(),
          phone: row['Телефон']?.trim(),
          status
        });
      });

      if (errors.length > 0) {
        toast({
          title: 'Ошибки импорта',
          description: errors.slice(0, 3).join('; '),
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }

      importProductionSites(sitesToImport);
      
      toast({
        title: 'Импорт завершен',
        description: `Добавлено площадок: ${sitesToImport.length}`
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Ошибка импорта',
        description: error instanceof Error ? error.message : 'Проверьте формат файла',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Импорт производственных площадок</DialogTitle>
          <DialogDescription>
            Скачайте шаблон Excel, заполните данными и импортируйте обратно
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <h4 className="font-semibold flex items-center gap-2">
              <Icon name="Info" size={16} />
              Формат файла
            </h4>
            <ul className="space-y-1 ml-6 list-disc text-muted-foreground">
              <li><strong>Организация</strong> — название должно точно совпадать с существующей организацией</li>
              <li><strong>Название площадки</strong> — обязательное поле</li>
              <li><strong>Код</strong> — уникальный код площадки (опционально)</li>
              <li><strong>Адрес</strong> — обязательное поле</li>
              <li><strong>Руководитель</strong> — ФИО руководителя (опционально)</li>
              <li><strong>Телефон</strong> — контактный телефон (опционально)</li>
              <li><strong>Статус</strong> — "Активна" или "Неактивна"</li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg space-y-2 text-sm border border-amber-200 dark:border-amber-900">
            <h4 className="font-semibold flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <Icon name="AlertTriangle" size={16} />
              Важно
            </h4>
            <ul className="space-y-1 ml-6 list-disc text-amber-800 dark:text-amber-200">
              <li>Организация должна существовать в системе до импорта</li>
              <li>Не изменяйте названия колонок в шаблоне</li>
              <li>Обязательные поля не должны быть пустыми</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button onClick={handleDownloadTemplate} variant="outline" className="w-full gap-2">
              <Icon name="Download" size={16} />
              Скачать шаблон Excel
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full gap-2"
              disabled={isProcessing}
            >
              <Icon name="Upload" size={16} />
              {isProcessing ? 'Обработка...' : 'Загрузить Excel файл'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}