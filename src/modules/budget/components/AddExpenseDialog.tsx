import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useBudgetStore } from '@/stores/budgetStore';
import { useOrganizationsStore } from '@/stores/organizationsStore';

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  year: number;
}

export default function AddExpenseDialog({ open, onClose, year }: AddExpenseDialogProps) {
  const { addExpense, getCategoriesByYear } = useBudgetStore();
  const { organizations } = useOrganizationsStore();

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [documentNumber, setDocumentNumber] = useState('');
  const [organizationId, setOrganizationId] = useState('');

  const categories = getCategoriesByYear(year);

  useEffect(() => {
    if (open) {
      setCategoryId('');
      setAmount('');
      setDescription('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setDocumentNumber('');
      setOrganizationId(organizations[0]?.id || '');
    }
  }, [open, organizations]);

  const handleSave = () => {
    if (!categoryId || !amount || !description) {
      alert('Заполните обязательные поля');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    addExpense({
      tenantId: 'tenant-1',
      categoryId,
      amount: numAmount,
      description,
      expenseDate,
      documentNumber: documentNumber || undefined,
      sourceType: 'manual',
      createdBy: 'user-1',
      organizationId: organizationId || undefined
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Добавить расход</DialogTitle>
          <DialogDescription>
            Внесите информацию о фактическом расходе средств
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">
              Статья бюджета <span className="text-red-500">*</span>
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Выберите статью" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Сумма (₽) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                Дата расхода <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Описание расхода <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Например: Закупка средств индивидуальной защиты"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document">Номер документа</Label>
              <Input
                id="document"
                placeholder="ИСХ-001"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Организация</Label>
              <Select value={organizationId} onValueChange={setOrganizationId}>
                <SelectTrigger id="organization">
                  <SelectValue placeholder="Выберите организацию" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.shortName || org.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Icon name="Save" size={16} />
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
