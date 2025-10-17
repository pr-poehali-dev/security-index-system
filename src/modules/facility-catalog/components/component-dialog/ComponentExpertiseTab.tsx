import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExpertiseRecord } from '@/types/facilities';
import FileUpload from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { uploadFileToStorage, openStoredFile } from '@/utils/fileStorage';

interface ComponentExpertiseTabProps {
  records: ExpertiseRecord[];
  onChange: (records: ExpertiseRecord[]) => void;
}

export default function ComponentExpertiseTab({ records, onChange }: ComponentExpertiseTabProps) {
  const { toast } = useToast();
  const [newRecord, setNewRecord] = useState({ date: '', conclusionNumber: '', expertOrganization: '', operatingPeriod: '', notes: '', scanUrl: '' });
  const [uploading, setUploading] = useState(false);



  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileId = await uploadFileToStorage(file);
      setNewRecord({...newRecord, scanUrl: fileId});
      toast({ title: 'Файл загружен', description: 'Скан заключения ЭПБ успешно загружен' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить файл', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = () => {
    if (!newRecord.date || !newRecord.conclusionNumber) return;
    onChange([...records, { id: crypto.randomUUID(), ...newRecord }]);
    setNewRecord({ date: '', conclusionNumber: '', expertOrganization: '', operatingPeriod: '', notes: '', scanUrl: '' });
  };

  return (
    <div className="space-y-4 p-1">
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Добавить запись ЭПБ</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Дата ЭПБ *</Label>
            <Input type="date" value={newRecord.date} onChange={(e) => setNewRecord({...newRecord, date: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>№ заключения *</Label>
            <Input value={newRecord.conclusionNumber} onChange={(e) => setNewRecord({...newRecord, conclusionNumber: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Экспертная организация</Label>
            <Input value={newRecord.expertOrganization} onChange={(e) => setNewRecord({...newRecord, expertOrganization: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Срок эксплуатации</Label>
            <Input value={newRecord.operatingPeriod} onChange={(e) => setNewRecord({...newRecord, operatingPeriod: e.target.value})} placeholder="10 лет" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Скан заключения ЭПБ</Label>
          <FileUpload
            label="Загрузить скан заключения"
            currentFileUrl={newRecord.scanUrl}
            onFileSelect={handleFileUpload}
            onFileRemove={() => setNewRecord({...newRecord, scanUrl: ''})}
            disabled={uploading}
          />
        </div>
        <Button onClick={handleAdd} disabled={!newRecord.date || !newRecord.conclusionNumber} size="sm">
          <Icon name="Plus" size={14} className="mr-2" />Добавить
        </Button>
      </div>

      {records.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>№ заключения</TableHead>
                <TableHead>Организация</TableHead>
                <TableHead>Срок</TableHead>
                <TableHead>Скан</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.conclusionNumber}</TableCell>
                  <TableCell>{record.expertOrganization || '—'}</TableCell>
                  <TableCell>{record.operatingPeriod || '—'}</TableCell>
                  <TableCell>
                    {record.scanUrl ? (
                      <Button size="sm" variant="link" onClick={() => openStoredFile(record.scanUrl!)} className="h-auto p-0">
                        <Icon name="FileText" size={14} className="mr-1" />
                        Открыть
                      </Button>
                    ) : '—'}
                  </TableCell>
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