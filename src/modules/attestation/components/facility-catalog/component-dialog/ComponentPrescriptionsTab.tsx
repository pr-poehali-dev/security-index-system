import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Prescription } from '@/types/facilities';

interface ComponentPrescriptionsTabProps {
  prescriptions: Prescription[];
  onChange: (prescriptions: Prescription[]) => void;
}

export default function ComponentPrescriptionsTab({ prescriptions, onChange }: ComponentPrescriptionsTabProps) {
  const [newPrescription, setNewPrescription] = useState({ date: '', essence: '' });

  const handleAdd = () => {
    if (!newPrescription.date || !newPrescription.essence) return;
    onChange([...prescriptions, { id: crypto.randomUUID(), ...newPrescription, status: 'open' }]);
    setNewPrescription({ date: '', essence: '' });
  };

  const toggleStatus = (id: string) => {
    onChange(prescriptions.map(p => {
      if (p.id === id) {
        const newStatus = p.status === 'open' ? 'closed' : 'open';
        return {
          ...p,
          status: newStatus,
          closedDate: newStatus === 'closed' ? new Date().toISOString() : undefined
        };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-4 p-1">
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Добавить предписание Ростехнадзора</h3>
        <div className="space-y-2">
          <Label>Дата *</Label>
          <Input type="date" value={newPrescription.date} onChange={(e) => setNewPrescription({...newPrescription, date: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Суть предписания *</Label>
          <Textarea value={newPrescription.essence} onChange={(e) => setNewPrescription({...newPrescription, essence: e.target.value})} rows={3} />
        </div>
        <Button onClick={handleAdd} disabled={!newPrescription.date || !newPrescription.essence} size="sm">
          <Icon name="Plus" size={14} className="mr-2" />Добавить
        </Button>
      </div>

      {prescriptions.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Суть предписания</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>{new Date(prescription.date).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-[400px]">{prescription.essence}</TableCell>
                  <TableCell>
                    <Badge className={prescription.status === 'open' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-green-100 text-green-700 dark:bg-green-900/30'}>
                      {prescription.status === 'open' ? 'Открыто' : 'Закрыто'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => toggleStatus(prescription.id)}>
                        <Icon name={prescription.status === 'open' ? 'Check' : 'RotateCcw'} size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onChange(prescriptions.filter(p => p.id !== prescription.id))}>
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
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
