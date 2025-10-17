import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MaintenanceRecord } from '@/types/facilities';
import FileUpload from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { uploadFileToStorage, openStoredFile } from '@/utils/fileStorage';

interface ComponentMaintenanceTabProps {
  records: MaintenanceRecord[];
  onChange: (records: MaintenanceRecord[]) => void;
}

export default function ComponentMaintenanceTab({ records, onChange }: ComponentMaintenanceTabProps) {
  const { toast } = useToast();
  const [newRecord, setNewRecord] = useState({ date: '', organization: '', notes: '', reportUrl: '' });
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const fileName = file.name;
        const stored = { fileName, dataUrl, uploadedAt: new Date().toISOString() };
        const fileId = crypto.randomUUID();
        localStorage.setItem(`file_${fileId}`, JSON.stringify(stored));
        resolve(fileId);
      };
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileId = await uploadFileToStorage(file);
      setNewRecord({...newRecord, reportUrl: fileId});
      toast({ title: 'Файл загружен', description: 'Отчет о ТОиР успешно загружен' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить файл', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = () => {
    if (!newRecord.date || !newRecord.organization) return;
    onChange([...records, { id: crypto.randomUUID(), ...newRecord }]);
    setNewRecord({ date: '', organization: '', notes: '', reportUrl: '' });
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
        <div className="space-y-2">
          <Label>Отчет о ТОиР</Label>
          <FileUpload
            label="Загрузить отчет"
            currentFileUrl={newRecord.reportUrl}
            onFileSelect={handleFileUpload}
            onFileRemove={() => setNewRecord({...newRecord, reportUrl: ''})}
            disabled={uploading}
          />
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
                <TableHead>Отчет</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.organization}</TableCell>
                  <TableCell>{record.notes || '—'}</TableCell>
                  <TableCell>
                    {record.reportUrl ? (
                      <Button size="sm" variant="link" onClick={() => openStoredFile(record.reportUrl!)} className="h-auto p-0">
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