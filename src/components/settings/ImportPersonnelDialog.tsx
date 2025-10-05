import { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { parsePersonnelCSV } from '@/lib/export-utils';
import Icon from '@/components/ui/icon';

interface ImportPersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImportPersonnelDialog({ open, onOpenChange }: ImportPersonnelDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { importPersonnel, organizations } = useSettingsStore();
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Ошибка',
        description: 'Выберите файл в формате CSV',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n').slice(0, 6);
      setPreview(lines.join('\n'));
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const personnel = parsePersonnelCSV(content, user!.tenantId!, organizations);

        if (personnel.length === 0) {
          toast({
            title: 'Ошибка',
            description: 'Не удалось распознать данные в файле',
            variant: 'destructive'
          });
          return;
        }

        importPersonnel(personnel);

        toast({
          title: 'Успешно',
          description: `Импортировано сотрудников: ${personnel.length}`
        });

        setSelectedFile(null);
        setPreview('');
        onOpenChange(false);
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось обработать файл',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(selectedFile);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Импорт персонала</DialogTitle>
          <DialogDescription>
            Загрузите CSV-файл с данными сотрудников
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Icon name="Info" size={16} />
            <AlertDescription>
              <strong>Формат файла:</strong> CSV с заголовками<br />
              ID, Организация, Подразделение, ФИО, Должность, Email, Телефон, Роль, Статус, Дата приема, Дата увольнения
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="Upload" size={16} />
              {selectedFile ? selectedFile.name : 'Выбрать файл'}
            </Button>
          </div>

          {preview && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Предпросмотр (первые 5 строк):</p>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                {preview}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile}>
            <Icon name="Upload" size={16} className="mr-2" />
            Импортировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
