import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { AttestationOrder, useAttestationOrdersStore } from '@/stores/attestationOrdersStore';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { exportOrderToDocx, exportOrderToPdf } from '../../utils/exportOrder';

interface ExportOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: AttestationOrder | null;
}

type ExportFormat = 'docx' | 'pdf';

export default function ExportOrderDialog({ open, onOpenChange, order }: ExportOrderDialogProps) {
  const { getOrderEmployees } = useAttestationOrdersStore();
  const { toast } = useToast();

  const [format, setFormat] = useState<ExportFormat>('docx');
  const [includeAppendix, setIncludeAppendix] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!order) return;

    setIsExporting(true);

    try {
      const employees = getOrderEmployees(order.id);
      
      const options = {
        includeAppendix,
        includeSignatures
      };

      if (format === 'docx') {
        await exportOrderToDocx(order, employees, options);
      } else {
        await exportOrderToPdf(order, employees, options);
      }

      toast({
        title: 'Экспорт завершен',
        description: `Приказ ${order.number} успешно экспортирован в формате ${format.toUpperCase()}`
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось экспортировать приказ. Попробуйте еще раз.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!order) return null;

  const employeeCount = getOrderEmployees(order.id).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Экспорт приказа {order.number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Формат экспорта</Label>
            <RadioGroup value={format} onValueChange={(value: ExportFormat) => setFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="docx" id="docx" />
                <Label htmlFor="docx" className="font-normal cursor-pointer flex items-center gap-2">
                  <Icon name="FileText" size={16} className="text-blue-600" />
                  <div>
                    <div>Word документ (.docx)</div>
                    <div className="text-xs text-muted-foreground">Редактируемый формат</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="font-normal cursor-pointer flex items-center gap-2">
                  <Icon name="FileDown" size={16} className="text-red-600" />
                  <div>
                    <div>PDF документ (.pdf)</div>
                    <div className="text-xs text-muted-foreground">Готовый к печати</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Параметры экспорта</Label>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="appendix"
                  checked={includeAppendix}
                  onCheckedChange={(checked) => setIncludeAppendix(!!checked)}
                  className="mt-1"
                />
                <Label htmlFor="appendix" className="font-normal cursor-pointer">
                  <div>Включить приложение со списком сотрудников</div>
                  <div className="text-xs text-muted-foreground">
                    Таблица с {employeeCount} {employeeCount === 1 ? 'сотрудником' : 'сотрудниками'}
                  </div>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="signatures"
                  checked={includeSignatures}
                  onCheckedChange={(checked) => setIncludeSignatures(!!checked)}
                  className="mt-1"
                />
                <Label htmlFor="signatures" className="font-normal cursor-pointer">
                  <div>Добавить поля для подписей</div>
                  <div className="text-xs text-muted-foreground">
                    Место для подписи руководителя и печати
                  </div>
                </Label>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="space-y-1">
                <div className="font-medium">Информация о приказе:</div>
                <div className="text-muted-foreground space-y-0.5">
                  <div>• Номер: {order.number}</div>
                  <div>• Дата: {new Date(order.date).toLocaleDateString('ru-RU')}</div>
                  <div>• Сотрудников: {employeeCount}</div>
                  <div>• Тип: {order.attestationType === 'rostechnadzor' ? 'Ростехнадзор' : 'Комиссия предприятия'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Отмена
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Экспорт...
              </>
            ) : (
              <>
                <Icon name="Download" size={16} className="mr-2" />
                Экспортировать {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}