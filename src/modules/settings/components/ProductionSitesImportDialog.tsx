import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { exportToExcel } from '@/lib/exportUtils';

interface ProductionSitesImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductionSitesImportDialog({ open, onOpenChange }: ProductionSitesImportDialogProps) {
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
    onOpenChange(false);
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

          <Button onClick={handleDownloadTemplate} className="w-full gap-2">
            <Icon name="Download" size={16} />
            Скачать шаблон Excel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
