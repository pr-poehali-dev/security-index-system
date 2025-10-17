import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Document } from '@/types/facilities';

interface FacilityDocumentsTabProps {
  documents: Document[];
  onChange: (docs: Document[]) => void;
}

const DOCUMENT_TYPES = [
  { value: 'license', label: 'Лицензия' },
  { value: 'declaration', label: 'Декларация промышленной безопасности' },
  { value: 'passport', label: 'Паспорт объекта' },
  { value: 'project', label: 'Проектная документация' },
  { value: 'other', label: 'Прочее' },
];

export default function FacilityDocumentsTab({
  documents,
  onChange,
}: FacilityDocumentsTabProps) {
  const [newDoc, setNewDoc] = useState({
    type: '',
    number: '',
    date: '',
    validUntil: '',
    notes: '',
  });

  const handleAdd = () => {
    if (!newDoc.type || !newDoc.number || !newDoc.date) return;
    
    const doc: Document = {
      id: crypto.randomUUID(),
      ...newDoc,
      scanUrl: '',
    };
    
    onChange([...documents, doc]);
    setNewDoc({ type: '', number: '', date: '', validUntil: '', notes: '' });
  };

  const handleDelete = (id: string) => {
    onChange(documents.filter(d => d.id !== id));
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Добавить документ</h3>
        
        <div className="space-y-2">
          <Label htmlFor="docType">Тип документа *</Label>
          <Select
            value={newDoc.type}
            onValueChange={(value) => setNewDoc({ ...newDoc, type: value })}
          >
            <SelectTrigger id="docType">
              <SelectValue placeholder="Выберите тип документа" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="docNumber">Номер документа *</Label>
            <Input
              id="docNumber"
              value={newDoc.number}
              onChange={(e) => setNewDoc({ ...newDoc, number: e.target.value })}
              placeholder="№ 123/456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="docDate">Дата выдачи *</Label>
            <Input
              id="docDate"
              type="date"
              value={newDoc.date}
              onChange={(e) => setNewDoc({ ...newDoc, date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="docValidUntil">Действителен до</Label>
            <Input
              id="docValidUntil"
              type="date"
              value={newDoc.validUntil}
              onChange={(e) => setNewDoc({ ...newDoc, validUntil: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="docNotes">Примечание</Label>
            <Input
              id="docNotes"
              value={newDoc.notes}
              onChange={(e) => setNewDoc({ ...newDoc, notes: e.target.value })}
              placeholder="Дополнительная информация..."
            />
          </div>
        </div>

        <Button
          onClick={handleAdd}
          disabled={!newDoc.type || !newDoc.number || !newDoc.date}
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить документ
        </Button>
      </div>

      {documents.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Тип документа</TableHead>
                <TableHead>Номер</TableHead>
                <TableHead>Дата выдачи</TableHead>
                <TableHead>Действителен до</TableHead>
                <TableHead>Примечание</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    {getDocumentTypeLabel(doc.type)}
                  </TableCell>
                  <TableCell>{doc.number}</TableCell>
                  <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {doc.validUntil ? new Date(doc.validUntil).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>{doc.notes || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(doc.id)}
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
