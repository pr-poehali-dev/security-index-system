import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ExaminationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examination: {
    id: string;
    object: string;
    type: string;
    scheduled: string;
    status: string;
    executor: string;
  } | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-700';
    case 'in_progress': return 'bg-amber-100 text-amber-700';
    case 'completed': return 'bg-emerald-100 text-emerald-700';
    case 'overdue': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    scheduled: 'Запланировано',
    in_progress: 'В процессе',
    completed: 'Завершено',
    overdue: 'Просрочено'
  };
  return labels[status] || status;
};

export default function ExaminationDetailsDialog({ open, onOpenChange, examination }: ExaminationDetailsDialogProps) {
  if (!examination) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{examination.type}</DialogTitle>
            <Badge className={getStatusColor(examination.status)}>
              {getStatusLabel(examination.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Объект</p>
              <div className="flex items-center gap-2">
                <Icon name="Building" size={16} className="text-gray-400" />
                <p className="font-medium">{examination.object}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500">Исполнитель</p>
              <div className="flex items-center gap-2">
                <Icon name="User" size={16} className="text-gray-400" />
                <p className="font-medium">{examination.executor}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500">Плановая дата</p>
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={16} className="text-gray-400" />
                <p className="font-medium">{new Date(examination.scheduled).toLocaleDateString('ru-RU')}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500">Номер договора</p>
              <p className="font-medium">№ 124/2024-ЭП</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Объем работ</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle2" size={16} className="text-emerald-600 mt-0.5" />
                <span>Визуальный и измерительный контроль оборудования</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle2" size={16} className="text-emerald-600 mt-0.5" />
                <span>Неразрушающий контроль сварных соединений</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle2" size={16} className="text-emerald-600 mt-0.5" />
                <span>Гидравлические испытания на прочность и плотность</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle2" size={16} className="text-emerald-600 mt-0.5" />
                <span>Оформление заключения экспертизы</span>
              </li>
            </ul>
          </div>

          {examination.status === 'completed' && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Результаты</h4>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="FileCheck" className="text-emerald-600 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-emerald-900">Заключение экспертизы</p>
                    <p className="text-sm text-emerald-700 mt-1">
                      Оборудование признано пригодным к дальнейшей эксплуатации
                    </p>
                    <Button variant="link" className="text-emerald-700 p-0 h-auto mt-2">
                      <Icon name="Download" size={14} className="mr-1" />
                      Скачать заключение.pdf
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Закрыть
            </Button>
            {examination.status === 'scheduled' && (
              <Button>
                <Icon name="Play" className="mr-2" size={16} />
                Начать выполнение
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
