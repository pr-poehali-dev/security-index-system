import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AttestationOrder, useAttestationOrdersStore } from '@/stores/attestationOrdersStore';
import { useToast } from '@/hooks/use-toast';

interface EditAttestationOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: AttestationOrder | null;
}

export default function EditAttestationOrderDialog({ open, onOpenChange, order }: EditAttestationOrderDialogProps) {
  const { updateOrder } = useAttestationOrdersStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    number: '',
    date: '',
    attestationType: 'rostechnadzor' as 'rostechnadzor' | 'company_commission',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'cancelled',
    notes: ''
  });

  useEffect(() => {
    if (order) {
      setFormData({
        number: order.number,
        date: order.date,
        attestationType: order.attestationType,
        status: order.status,
        notes: order.notes || ''
      });
    }
  }, [order]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!order) return;

    if (!formData.number.trim()) {
      toast({ title: 'Ошибка', description: 'Укажите номер приказа', variant: 'destructive' });
      return;
    }

    updateOrder(order.id, {
      number: formData.number,
      date: formData.date,
      attestationType: formData.attestationType,
      status: formData.status,
      notes: formData.notes
    });

    toast({ 
      title: 'Приказ обновлен', 
      description: `Приказ ${formData.number} успешно обновлен` 
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактировать приказ</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Номер приказа *</Label>
              <Input
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="ПА-001-2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Дата приказа *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Тип аттестации *</Label>
            <Select 
              value={formData.attestationType} 
              onValueChange={(value: any) => setFormData({ ...formData, attestationType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rostechnadzor">Ростехнадзор</SelectItem>
                <SelectItem value="company_commission">Комиссия предприятия</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Статус *</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="active">Активен</SelectItem>
                <SelectItem value="completed">Завершен</SelectItem>
                <SelectItem value="cancelled">Отменен</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Примечания</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
