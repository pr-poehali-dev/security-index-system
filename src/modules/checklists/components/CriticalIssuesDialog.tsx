import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface CriticalIssue {
  question: string;
  comment?: string;
  incidentId: string;
  taskId: string;
}

interface CriticalIssuesDialogProps {
  open: boolean;
  onClose: () => void;
  issues: CriticalIssue[];
}

export default function CriticalIssuesDialog({ open, onClose, issues }: CriticalIssuesDialogProps) {
  const navigate = useNavigate();

  const handleViewIncidents = () => {
    onClose();
    navigate('/incidents');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Icon name="AlertTriangle" className="text-red-600" size={24} />
            </div>
            <div>
              <DialogTitle>Обнаружены критические замечания</DialogTitle>
              <DialogDescription>
                Автоматически созданы инциденты и задачи по устранению
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="text-yellow-600 mt-0.5" size={20} />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Что произошло?</p>
                <p>
                  В ходе проверки выявлено <strong>{issues.length}</strong> критических несоответствий. 
                  Для каждого автоматически создан инцидент и задача по устранению.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">Созданные инциденты:</h4>
            {issues.map((issue, index) => (
              <Card key={index} className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="destructive" className="mt-0.5">
                      Критично
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">{issue.question}</p>
                      {issue.comment && (
                        <p className="text-xs text-gray-600">{issue.comment}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Icon name="AlertCircle" size={12} />
                          Инцидент #{issue.incidentId.slice(-4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="CheckSquare" size={12} />
                          Задача #{issue.taskId.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Clock" className="text-blue-600 mt-0.5" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Срок устранения</p>
                <p>Для всех созданных инцидентов установлен срок <strong>7 дней</strong> с текущей даты.</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Понятно
          </Button>
          <Button onClick={handleViewIncidents} className="gap-2">
            <Icon name="ExternalLink" size={16} />
            Перейти к инцидентам
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
