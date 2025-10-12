import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useBudgetStore } from '@/stores/budgetStore';

interface BudgetCategoriesDialogProps {
  open: boolean;
  onClose: () => void;
  year: number;
}

const PRESET_COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export default function BudgetCategoriesDialog({ open, onClose, year }: BudgetCategoriesDialogProps) {
  const { getCategoriesByYear, addCategory, updateCategory, deleteCategory } = useBudgetStore();
  const categories = getCategoriesByYear(year);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPlannedAmount('');
    setColor(PRESET_COLORS[0]);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!name || !plannedAmount) {
      alert('Заполните обязательные поля');
      return;
    }

    const amount = parseFloat(plannedAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    addCategory({
      tenantId: 'tenant-1',
      name,
      description: description || undefined,
      plannedAmount: amount,
      year,
      color,
      status: 'active'
    });

    resetForm();
  };

  const handleEdit = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    setEditingId(categoryId);
    setName(category.name);
    setDescription(category.description || '');
    setPlannedAmount(category.plannedAmount.toString());
    setColor(category.color || PRESET_COLORS[0]);
    setIsAdding(true);
  };

  const handleUpdate = () => {
    if (!editingId || !name || !plannedAmount) {
      alert('Заполните обязательные поля');
      return;
    }

    const amount = parseFloat(plannedAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    updateCategory(editingId, {
      name,
      description: description || undefined,
      plannedAmount: amount,
      color
    });

    resetForm();
  };

  const handleDelete = (categoryId: string) => {
    if (confirm('Удалить статью бюджета? Связанные расходы останутся без категории.')) {
      deleteCategory(categoryId);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Управление статьями бюджета</DialogTitle>
          <DialogDescription>
            Настройка категорий для планирования бюджета {year} года
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="gap-2 w-full">
              <Icon name="Plus" size={16} />
              Добавить статью
            </Button>
          )}

          {isAdding && (
            <Card className="border-2 border-primary">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">
                    {editingId ? 'Редактирование статьи' : 'Новая статья'}
                  </h4>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <Icon name="X" size={16} />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Название <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Например: Пожарная безопасность"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      placeholder="Краткое описание статьи"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Плановая сумма (₽) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={plannedAmount}
                      onChange={(e) => setPlannedAmount(e.target.value)}
                      min="0"
                      step="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Цвет</Label>
                    <div className="flex gap-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            color === c ? 'border-gray-900 scale-110' : 'border-gray-300'
                          } transition-transform`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetForm} className="flex-1">
                    Отмена
                  </Button>
                  <Button 
                    onClick={editingId ? handleUpdate : handleAdd} 
                    className="flex-1 gap-2"
                  >
                    <Icon name="Save" size={16} />
                    {editingId ? 'Сохранить' : 'Добавить'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">
              Статьи бюджета ({categories.length})
            </h4>
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{category.name}</h4>
                        <Badge variant="outline">
                          {formatCurrency(category.plannedAmount)}
                        </Badge>
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category.id)}
                      >
                        <Icon name="Pencil" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Icon name="FolderOpen" size={48} className="mx-auto mb-2 opacity-50" />
                <p>Нет статей бюджета на {year} год</p>
                <p className="text-sm">Создайте первую статью бюджета</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
