import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MaintenanceRecord } from '@/types/facilities';

interface ComponentMaintenanceTabProps {
  records: MaintenanceRecord[];
  onChange: (records: MaintenanceRecord[]) => void;
}

export default function ComponentMaintenanceTab({ records, onChange }: ComponentMaintenanceTabProps) {
  const [newRecord, setNewRecord] = useState({ date: '', organization: '', notes: '' });

  const handleAdd = () => {
    if (!newRecord.date || !newRecord.organization) return;
    onChange([...records, { id: crypto.randomUUID(), ...newRecord, reportUrl: '' }]);
    setNewRecord({ date: '', organization: '', notes: '' });
  };

  return (
    <div className="space-y-4 p-1">
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Добавить запись ТО</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Дата *</Label>
            <Input type="date" value={newRecord.date} onChange={(e) => setNewRecord({...newRecord, date: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Организация *</Label>
            <Input value={newRecord.organization} onChange={(e) => setNewRecord({...newRecord, organization: e.target.value})} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Примечание</Label>
          <Textarea value={newRecord.notes} onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})} />
        </div>
        <Button onClick={handleAdd} disabled={!newRecord.date || !newRecord.organization} size="sm">
          <Icon name="Plus" size={14} className="mr-2" />Добавить
        </Button>
      </div>

      {records.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Организация</TableHead>
                <TableHead>Примечание</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.organization}</TableCell>
                  <TableCell>{record.notes || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => onChange(records.filter(r => r.id !== record.id))}>
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
