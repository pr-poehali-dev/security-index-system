import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PositionDialog from './PositionDialog';
import type { Position } from '@/types';

export default function PositionsDirectoryTab() {
  const { positions, addPosition, updatePosition, deletePosition } = useSettingsStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | undefined>();

  const handleAdd = () => {
    setEditingPosition(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setDialogOpen(true);
  };

  const handleSave = (positionData: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPosition) {
      updatePosition(editingPosition.id, positionData);
    } else {
      addPosition(positionData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить эту должность из справочника?')) {
      deletePosition(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Справочник должностей</h2>
          <p className="text-sm text-muted-foreground">
            Управление списком должностей в организации
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Добавить
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название должности</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Нет данных. Добавьте первую должность.
                </TableCell>
              </TableRow>
            ) : (
              positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">{position.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {position.description || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(position)}
                      >
                        <Icon name="Pencil" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(position.id)}
                      >
                        <Icon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PositionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        position={editingPosition}
        onSave={handleSave}
      />
    </div>
  );
}
