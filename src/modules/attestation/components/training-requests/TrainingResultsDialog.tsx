import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrainingRequest } from '@/types/attestation';

interface TrainingResult {
  id: string;
  organization: string;
  fullName: string;
  position: string;
  attestationArea: string;
  certificateNumber: string;
  certificateDate: string;
}

interface TrainingResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: TrainingRequest | null;
  results: TrainingResult[];
  onConfirm: (selectedIds: string[]) => void;
}

export default function TrainingResultsDialog({
  open,
  onOpenChange,
  request,
  results,
  onConfirm,
}: TrainingResultsDialogProps) {
  const [selectedResults, setSelectedResults] = useState<string[]>([]);

  const toggleResult = (id: string) => {
    setSelectedResults(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedResults);
    setSelectedResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Результаты обучения - {request?.programName}</DialogTitle>
          <DialogDescription>
            Выберите записи, которые нужно загрузить в систему в качестве
            сертификатов сотрудников
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Получено {results.length} записей из учебного центра. Отметьте галочками
              те записи, которые нужно добавить в систему.
            </p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedResults.length === results.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedResults(results.map(r => r.id));
                        } else {
                          setSelectedResults([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Организация</TableHead>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Должность</TableHead>
                  <TableHead>Область аттестации</TableHead>
                  <TableHead>Номер удостоверения</TableHead>
                  <TableHead>Дата выдачи</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow
                    key={result.id}
                    className={selectedResults.includes(result.id) ? 'bg-blue-50 dark:bg-blue-950/20' : ''}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedResults.includes(result.id)}
                        onChange={() => toggleResult(result.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{result.organization}</TableCell>
                    <TableCell>{result.fullName}</TableCell>
                    <TableCell>{result.position}</TableCell>
                    <TableCell>
                      <div className="max-w-[300px]">{result.attestationArea}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.certificateNumber}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(result.certificateDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {selectedResults.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <Icon name="CheckCircle2" size={16} className="text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-900 dark:text-green-100">
                Выбрано записей: {selectedResults.length}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedResults.length === 0}
          >
            <Icon name="Download" size={16} className="mr-2" />
            Загрузить в систему ({selectedResults.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
