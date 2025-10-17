import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { RostechnadzorDirective } from '@/types/facilities';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ComponentDirectivesTabProps {
  directives: RostechnadzorDirective[];
  onChange: (directives: RostechnadzorDirective[]) => void;
}

export default function ComponentDirectivesTab({
  directives,
  onChange,
}: ComponentDirectivesTabProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<RostechnadzorDirective, 'id'>>({
    date: '',
    description: '',
  });

  const handleAdd = () => {
    setEditingIndex(null);
    setFormData({ date: '', description: '' });
    setShowDialog(true);
  };

  const handleEdit = (index: number) => {
    const directive = directives[index];
    setEditingIndex(index);
    setFormData({
      date: directive.date,
      description: directive.description,
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!formData.date || !formData.description) return;

    const newDirective: RostechnadzorDirective = {
      id: editingIndex !== null ? directives[editingIndex].id : crypto.randomUUID(),
      ...formData,
    };

    if (editingIndex !== null) {
      const updated = [...directives];
      updated[editingIndex] = newDirective;
      onChange(updated);
    } else {
      onChange([...directives, newDirective]);
    }

    setShowDialog(false);
  };

  const handleDelete = (index: number) => {
    if (confirm('Удалить запись о предписании?')) {
      onChange(directives.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          История предписаний Ростехнадзора
        </p>
        <Button size="sm" onClick={handleAdd}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить предписание
        </Button>
      </div>

      {directives.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="FileText" size={48} className="mx-auto mb-2 opacity-20" />
          <p>Нет записей о предписаниях</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Суть предписания</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {directives.map((directive, index) => (
              <TableRow key={directive.id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(directive.date).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell>{directive.description}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(index)}
                    >
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(index)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Редактировать' : 'Добавить'} предписание
            </DialogTitle>
            <DialogDescription>
              Укажите дату и суть предписания Ростехнадзора
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Дата предписания *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Суть предписания *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Опишите суть предписания"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.date || !formData.description}
              >
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
