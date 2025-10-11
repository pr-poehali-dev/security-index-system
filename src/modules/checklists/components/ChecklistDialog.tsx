import { useState, useEffect } from 'react';
import { useChecklistsStore } from '@/stores/checklistsStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import type { Checklist, ChecklistItem } from '@/types';

interface ChecklistDialogProps {
  open: boolean;
  onClose: () => void;
  checklist?: Checklist;
}

const CATEGORIES = [
  { value: 'fire_safety', label: 'Пожарная безопасность' },
  { value: 'equipment', label: 'Оборудование' },
  { value: 'ppe', label: 'СИЗ' },
  { value: 'workplace', label: 'Рабочие места' },
  { value: 'electrical', label: 'Электробезопасность' },
  { value: 'chemical', label: 'Химическая безопасность' },
  { value: 'other', label: 'Другое' }
];

export default function ChecklistDialog({ open, onClose, checklist }: ChecklistDialogProps) {
  const { addChecklist, updateChecklist } = useChecklistsStore();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('fire_safety');
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (checklist) {
      setName(checklist.name);
      setCategory(checklist.category);
      setItems(checklist.items);
    } else {
      setName('');
      setCategory('fire_safety');
      setItems([]);
    }
  }, [checklist, open]);

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      question: '',
      requiresComment: false,
      criticalItem: false
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
  };

  const handleSave = () => {
    if (!name.trim() || items.length === 0) {
      return;
    }

    const checklistData = {
      tenantId: 'tenant-1',
      name: name.trim(),
      category,
      items: items.filter(item => item.question.trim())
    };

    if (checklist) {
      updateChecklist(checklist.id, checklistData);
    } else {
      addChecklist(checklistData);
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {checklist ? 'Редактировать чек-лист' : 'Создать чек-лист'}
          </DialogTitle>
          <DialogDescription>
            Заполните название, категорию и добавьте вопросы для проверки
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название чек-листа</Label>
            <Input
              id="name"
              placeholder="Например: Проверка пожарной безопасности"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Категория</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Вопросы ({items.length})</Label>
              <Button onClick={addItem} size="sm" variant="outline" className="gap-2">
                <Icon name="Plus" size={16} />
                Добавить вопрос
              </Button>
            </div>

            {items.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Icon name="ListChecks" className="mx-auto mb-3 text-gray-400" size={40} />
                  <p className="text-sm text-gray-500">Добавьте вопросы для проверки</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveItem(index, 'up')}
                              disabled={index === 0}
                              className="h-6 w-6 p-0"
                            >
                              <Icon name="ChevronUp" size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveItem(index, 'down')}
                              disabled={index === items.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              <Icon name="ChevronDown" size={14} />
                            </Button>
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                              {item.criticalItem && (
                                <Badge variant="destructive" className="text-xs">
                                  Критичный
                                </Badge>
                              )}
                            </div>
                            <Input
                              placeholder="Введите вопрос"
                              value={item.question}
                              onChange={(e) => updateItem(item.id, { question: e.target.value })}
                            />
                            
                            <div className="flex items-center gap-4 text-sm">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                  checked={item.requiresComment}
                                  onCheckedChange={(checked) => 
                                    updateItem(item.id, { requiresComment: checked as boolean })
                                  }
                                />
                                <span>Требуется комментарий</span>
                              </label>
                              
                              <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                  checked={item.criticalItem}
                                  onCheckedChange={(checked) => 
                                    updateItem(item.id, { criticalItem: checked as boolean })
                                  }
                                />
                                <span>Критичный пункт</span>
                              </label>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name.trim() || items.length === 0 || items.every(i => !i.question.trim())}
          >
            {checklist ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
