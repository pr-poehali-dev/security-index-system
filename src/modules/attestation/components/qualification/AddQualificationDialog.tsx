import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useQualificationStore } from '../../stores/qualificationStore';
import { useContractorsStore } from '@/modules/catalog/stores/contractorsStore';
import { useToast } from '@/hooks/use-toast';
import { 
  CERTIFICATION_CATEGORIES, 
  CERTIFICATION_AREAS_BY_CATEGORY 
} from '@/lib/constants';

interface AddQualificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
}

export default function AddQualificationDialog({
  open,
  onOpenChange,
  employeeId,
}: AddQualificationDialogProps) {
  const addCertificate = useQualificationStore((state) => state.addCertificate);
  const { contractors } = useContractorsStore();
  const { toast } = useToast();

  const [category, setCategory] = useState('');
  const [certificationTypeId, setCertificationTypeId] = useState('');
  const [number, setNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [trainingCenterId, setTrainingCenterId] = useState('');
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  const trainingCenters = contractors.filter(c => c.type === 'training_center');

  const certificationAreas = category 
    ? CERTIFICATION_AREAS_BY_CATEGORY[category as keyof typeof CERTIFICATION_AREAS_BY_CATEGORY] || []
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Размер файла не должен превышать 10 МБ',
          variant: 'destructive',
        });
        return;
      }
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        toast({
          title: 'Ошибка',
          description: 'Поддерживаются только PDF и изображения',
          variant: 'destructive',
        });
        return;
      }
      setScanFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificationTypeId || !number || !issueDate || !trainingCenterId) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addCertificate({
        employeeId,
        certificationTypeId,
        number,
        issueDate,
        trainingCenterId,
        scanFile: scanFile || undefined,
        notes: notes || undefined,
      });

      toast({
        title: 'Успешно',
        description: 'Удостоверение повышения квалификации добавлено',
      });

      setCategory('');
      setCertificationTypeId('');
      setNumber('');
      setIssueDate('');
      setTrainingCenterId('');
      setScanFile(null);
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить удостоверение',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Award" size={20} />
            Добавить удостоверение повышения квалификации
          </DialogTitle>
          <DialogDescription>
            Срок действия удостоверения — 5 лет с даты выдачи
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">
              Категория аттестации <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={(value) => {
              setCategory(value);
              setCertificationTypeId('');
            }}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {CERTIFICATION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label} ({cat.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificationTypeId">
              Область аттестации <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={certificationTypeId} 
              onValueChange={setCertificationTypeId}
              disabled={!category}
            >
              <SelectTrigger id="certificationTypeId">
                <SelectValue placeholder={category ? "Выберите область" : "Сначала выберите категорию"} />
              </SelectTrigger>
              <SelectContent>
                {certificationAreas.map((area) => (
                  <SelectItem key={area.code} value={area.code}>
                    {area.code} - {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">
              Номер удостоверения <span className="text-destructive">*</span>
            </Label>
            <Input
              id="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="ПК-2023-001234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueDate">
              Дата выдачи <span className="text-destructive">*</span>
            </Label>
            <Input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trainingCenterId">
              Учебный центр <span className="text-destructive">*</span>
            </Label>
            <Select value={trainingCenterId} onValueChange={setTrainingCenterId}>
              <SelectTrigger id="trainingCenterId">
                <SelectValue placeholder="Выберите учебный центр" />
              </SelectTrigger>
              <SelectContent>
                {trainingCenters.length > 0 ? (
                  trainingCenters.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Нет доступных учебных центров
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scan">Скан удостоверения</Label>
            <div className="flex items-center gap-2">
              <Input
                id="scan"
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                className="flex-1"
              />
              {scanFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setScanFile(null)}
                >
                  <Icon name="X" size={16} />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              PDF или изображение, до 10 МБ
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
