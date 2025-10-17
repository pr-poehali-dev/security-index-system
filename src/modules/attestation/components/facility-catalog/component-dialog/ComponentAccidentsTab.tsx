import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AccidentRecord } from '@/types/facilities';

interface ComponentAccidentsTabProps {
  accidents: AccidentRecord[];
  onChange: (accidents: AccidentRecord[]) => void;
}

export default function ComponentAccidentsTab({ accidents, onChange }: ComponentAccidentsTabProps) {
  const [newAccident, setNewAccident] = useState({ date: '', description: '' });

  const handleAdd = () => {
    if (!newAccident.date || !newAccident.description) return;
    onChange([...accidents, { id: crypto.randomUUID(), ...newAccident }]);
    setNewAccident({ date: '', description: '' });
  };

  return (
    <div className="space-y-4 p-1">
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Добавить запись об аварии</h3>
        <div className="space-y-2">
          <Label>Дата *</Label>
          <Input type="date" value={newAccident.date} onChange={(e) => setNewAccident({...newAccident, date: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Описание аварии *</Label>
          <Textarea value={newAccident.description} onChange={(e) => setNewAccident({...newAccident, description: e.target.value})} rows={3} />
        </div>
        <Button onClick={handleAdd} disabled={!newAccident.date || !newAccident.description} size="sm">
          <Icon name="Plus" size={14} className="mr-2" />Добавить
        </Button>
      </div>

      {accidents.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accidents.map((accident) => (
                <TableRow key={accident.id}>
                  <TableCell>{new Date(accident.date).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-[500px]">{accident.description}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => onChange(accidents.filter(a => a.id !== accident.id))}>
                      <Icon name="Trash2" size={14} />
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
