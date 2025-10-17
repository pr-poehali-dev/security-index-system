import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { HazardIdentification } from '@/types/facilities';

interface FacilityHazardIdentificationTabProps {
  hazardIdentifications: HazardIdentification[];
  onChange: (hazards: HazardIdentification[]) => void;
}

export default function FacilityHazardIdentificationTab({
  hazardIdentifications,
  onChange,
}: FacilityHazardIdentificationTabProps) {
  const [newHazard, setNewHazard] = useState({
    category: '',
    description: '',
    quantity: '',
    unit: '',
  });

  const handleAdd = () => {
    if (!newHazard.category || !newHazard.description) return;
    
    const hazard: HazardIdentification = {
      id: crypto.randomUUID(),
      ...newHazard,
    };
    
    onChange([...hazardIdentifications, hazard]);
    setNewHazard({ category: '', description: '', quantity: '', unit: '' });
  };

  const handleDelete = (id: string) => {
    onChange(hazardIdentifications.filter(h => h.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Добавить опасность</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Категория опасности</Label>
            <Input
              id="category"
              value={newHazard.category}
              onChange={(e) => setNewHazard({ ...newHazard, category: e.target.value })}
              placeholder="Например: Взрывоопасность"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Input
              id="description"
              value={newHazard.description}
              onChange={(e) => setNewHazard({ ...newHazard, description: e.target.value })}
              placeholder="Описание опасности..."
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="quantity">Количество</Label>
            <Input
              id="quantity"
              value={newHazard.quantity}
              onChange={(e) => setNewHazard({ ...newHazard, quantity: e.target.value })}
              placeholder="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Единица</Label>
            <Input
              id="unit"
              value={newHazard.unit}
              onChange={(e) => setNewHazard({ ...newHazard, unit: e.target.value })}
              placeholder="тонн"
            />
          </div>
        </div>

        <Button onClick={handleAdd} disabled={!newHazard.category || !newHazard.description}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить опасность
        </Button>
      </div>

      {hazardIdentifications.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Категория</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Количество</TableHead>
                <TableHead>Единица</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hazardIdentifications.map((hazard) => (
                <TableRow key={hazard.id}>
                  <TableCell className="font-medium">{hazard.category}</TableCell>
                  <TableCell>{hazard.description}</TableCell>
                  <TableCell>{hazard.quantity || '—'}</TableCell>
                  <TableCell>{hazard.unit || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(hazard.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
