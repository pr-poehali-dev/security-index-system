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
import { useDpoQualificationStore } from '@/stores/dpoQualificationStore';
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
  const addQualification = useDpoQualificationStore((state) => state.addQualification);
  const { toast } = useToast();

  const [category, setCategory] = useState<'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology'>('industrial_safety');
  const [programName, setProgramName] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [duration, setDuration] = useState('72');
  const [trainingOrganizationId, setTrainingOrganizationId] = useState('');
  const [trainingOrganizationName, setTrainingOrganizationName] = useState('');
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  const trainingCenters: Array<{id: string; name: string}> = [];



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

    if (!programName || !certificateNumber || !issueDate || !expiryDate || !trainingOrganizationId) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      addQualification({
        personnelId: employeeId,
        tenantId: 'tenant-1',
        category,
        programName,
        trainingOrganizationId,
        trainingOrganizationName: trainingOrganizationName || 'Учебный центр',
        certificateNumber,
        issueDate,
        expiryDate,
        duration: parseInt(duration) || 72,
        notes: notes || undefined,
      });

      toast({
        title: 'Успешно',
        description: 'Удостоверение повышения квалификации добавлено',
      });

      setCategory('industrial_safety');
      setProgramName('');
      setCertificateNumber('');
      setIssueDate('');
      setExpiryDate('');
      setDuration('72');
      setTrainingOrganizationId('');
      setTrainingOrganizationName('');
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
            <Select value={category} onValueChange={(value) => setCategory(value as any)}>
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
            <Label htmlFor="programName">
              Название программы <span className="text-destructive">*</span>
            </Label>
            <Input
              id="programName"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="Промышленная безопасность опасных производственных объектов"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificateNumber">
              Номер удостоверения <span className="text-destructive">*</span>
            </Label>
            <Input
              id="certificateNumber"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              placeholder="ДПО-2023-001234"
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
            <Label htmlFor="expiryDate">
              Срок действия <span className="text-destructive">*</span>
            </Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={issueDate || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">
              Длительность (часов) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="72"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trainingOrganizationId">
              ID учебного центра <span className="text-destructive">*</span>
            </Label>
            <Input
              id="trainingOrganizationId"
              value={trainingOrganizationId}
              onChange={(e) => setTrainingOrganizationId(e.target.value)}
              placeholder="training-center-1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trainingOrganizationName">
              Название учебного центра
            </Label>
            <Input
              id="trainingOrganizationName"
              value={trainingOrganizationName}
              onChange={(e) => setTrainingOrganizationName(e.target.value)}
              placeholder="АНО ДПО \"Учебный центр\""
            />
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