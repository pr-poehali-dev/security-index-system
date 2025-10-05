import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface UploadConclusionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examination: {
    id: string;
    object: string;
    type: string;
  } | null;
}

export default function UploadConclusionDialog({ open, onOpenChange, examination }: UploadConclusionDialogProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('suitable');
  const [notes, setNotes] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Заключение загружено',
      description: 'Экспертиза завершена успешно'
    });
    onOpenChange(false);
    setFile(null);
    setResult('suitable');
    setNotes('');
  };

  if (!examination) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Загрузить заключение экспертизы</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Объект</p>
          <p className="font-semibold">{examination.object}</p>
          <p className="text-sm text-gray-600 mt-2">Тип диагностирования</p>
          <p className="font-semibold">{examination.type}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Результат экспертизы</Label>
            <RadioGroup value={result} onValueChange={setResult}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="suitable" id="suitable" />
                <Label htmlFor="suitable" className="font-normal cursor-pointer">
                  Пригодно к эксплуатации
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conditional" id="conditional" />
                <Label htmlFor="conditional" className="font-normal cursor-pointer">
                  Пригодно к эксплуатации с замечаниями
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unsuitable" id="unsuitable" />
                <Label htmlFor="unsuitable" className="font-normal cursor-pointer">
                  Не пригодно к эксплуатации
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Файл заключения (PDF)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label htmlFor="file" className="cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <Icon name="FileCheck" className="text-emerald-600" size={24} />
                    <span className="text-emerald-600 font-medium">{file.name}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Icon name="Upload" className="mx-auto text-gray-400" size={32} />
                    <p className="text-sm text-gray-600">
                      Нажмите для выбора файла или перетащите сюда
                    </p>
                    <p className="text-xs text-gray-400">PDF до 10 МБ</p>
                  </div>
                )}
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания и рекомендации</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительная информация, замечания, рекомендации по эксплуатации..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={!file}>
              <Icon name="Upload" className="mr-2" size={16} />
              Загрузить заключение
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
