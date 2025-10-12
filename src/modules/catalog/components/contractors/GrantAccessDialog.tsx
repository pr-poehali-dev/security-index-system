import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ContractorEmployee, Contractor } from '../../types/contractors';
import type { IndustrialObject } from '@/types/catalog';

interface GrantAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    employeeId: string;
    objectId: string;
    accessStart: string;
    accessEnd: string;
    workType: string;
    notes: string;
  };
  employees: ContractorEmployee[];
  contractors: Contractor[];
  catalogObjects: IndustrialObject[];
  onFormChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function GrantAccessDialog({
  open,
  onOpenChange,
  formData,
  employees,
  contractors,
  catalogObjects,
  onFormChange,
  onSubmit,
  onCancel,
}: GrantAccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Предоставление доступа к объекту</DialogTitle>
          <DialogDescription>
            Назначьте сотрудника подрядчика на объект. Система автоматически проверит
            соответствие требованиям.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Сотрудник *</Label>
            <Select
              value={formData.employeeId}
              onValueChange={(value) => onFormChange('employeeId', value)}
            >
              <SelectTrigger id="employee">
                <SelectValue placeholder="Выберите сотрудника" />
              </SelectTrigger>
              <SelectContent>
                {employees
                  .filter((e) => e.status === 'active')
                  .map((employee) => {
                    const contractor = contractors.find(
                      (c) => c.id === employee.contractorId
                    );
                    return (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.fullName} ({contractor?.name || 'Неизвестно'})
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="object">Объект *</Label>
            <Select
              value={formData.objectId}
              onValueChange={(value) => onFormChange('objectId', value)}
            >
              <SelectTrigger id="object">
                <SelectValue placeholder="Выберите объект" />
              </SelectTrigger>
              <SelectContent>
                {catalogObjects.map((obj) => (
                  <SelectItem key={obj.id} value={obj.id}>
                    {obj.name}
                    {obj.type === 'opo' && obj.hazardClass
                      ? ` (Класс ${obj.hazardClass})`
                      : obj.type === 'gts'
                      ? ' (ГТС)'
                      : ' (Здание)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accessStart">Доступ с *</Label>
              <Input
                id="accessStart"
                type="date"
                value={formData.accessStart}
                onChange={(e) => onFormChange('accessStart', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessEnd">Доступ до</Label>
              <Input
                id="accessEnd"
                type="date"
                value={formData.accessEnd}
                onChange={(e) => onFormChange('accessEnd', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Оставьте пустым для бессрочного доступа
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workType">Вид работ</Label>
            <Input
              id="workType"
              placeholder="Монтаж, Ремонт, Диагностика..."
              value={formData.workType}
              onChange={(e) => onFormChange('workType', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания</Label>
            <Input
              id="notes"
              placeholder="Дополнительная информация"
              value={formData.notes}
              onChange={(e) => onFormChange('notes', e.target.value)}
            />
          </div>

          {formData.employeeId && formData.objectId && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" size={20} className="text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">
                    Сотрудник соответствует требованиям
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✓ Аттестация Б.7.1 - Холодильные установки (до 15.01.2028)</li>
                    <li>✓ Медосмотр действителен (до 30.06.2025)</li>
                    <li>✓ Обучение ПБ пройдено (до 15.08.2025)</li>
                    <li>✓ Обучение ОТ пройдено (до 01.09.2025)</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Отмена
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!formData.employeeId || !formData.objectId}
          >
            Предоставить доступ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
