import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FacilityComponent, CustomDocument } from '@/types/facilities';

interface ComponentDocumentationTabProps {
  formData: Partial<FacilityComponent>;
  updateFormField: <K extends keyof FacilityComponent>(field: K, value: FacilityComponent[K]) => void;
}

export default function ComponentDocumentationTab({
  formData,
  updateFormField,
}: ComponentDocumentationTabProps) {
  const [newDoc, setNewDoc] = useState({ name: '', number: '', date: '' });

  const handleAddCustomDoc = () => {
    if (!newDoc.name) return;
    const doc: CustomDocument = { id: crypto.randomUUID(), ...newDoc, scanUrl: '' };
    updateFormField('customDocuments', [...(formData.customDocuments || []), doc]);
    setNewDoc({ name: '', number: '', date: '' });
  };

  const handleDeleteCustomDoc = (id: string) => {
    updateFormField('customDocuments', (formData.customDocuments || []).filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6 p-1">
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Паспорт объекта</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="passportNumber">Номер паспорта</Label>
            <Input id="passportNumber" value={formData.passportNumber || ''} onChange={(e) => updateFormField('passportNumber', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passportDate">Дата</Label>
            <Input id="passportDate" type="date" value={formData.passportDate || ''} onChange={(e) => updateFormField('passportDate', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Наличие проекта</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="projectNumber">Номер проекта</Label>
            <Input id="projectNumber" value={formData.projectNumber || ''} onChange={(e) => updateFormField('projectNumber', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectDate">Дата</Label>
            <Input id="projectDate" type="date" value={formData.projectDate || ''} onChange={(e) => updateFormField('projectDate', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Прочие документы</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="docName">Наименование</Label>
            <Input id="docName" value={newDoc.name} onChange={(e) => setNewDoc({...newDoc, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="docNumber">Номер</Label>
            <Input id="docNumber" value={newDoc.number} onChange={(e) => setNewDoc({...newDoc, number: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="docDate">Дата</Label>
            <Input id="docDate" type="date" value={newDoc.date} onChange={(e) => setNewDoc({...newDoc, date: e.target.value})} />
          </div>
        </div>
        <Button onClick={handleAddCustomDoc} disabled={!newDoc.name} size="sm">
          <Icon name="Plus" size={14} className="mr-2" />Добавить
        </Button>

        {(formData.customDocuments || []).length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Номер</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.customDocuments?.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell>{doc.number || '—'}</TableCell>
                    <TableCell>{doc.date ? new Date(doc.date).toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteCustomDoc(doc.id)}>
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
    </div>
  );
}
