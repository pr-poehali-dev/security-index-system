import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { Audit } from '@/types';

interface AuditCardProps {
  audit: Audit;
  checklistName?: string;
}

const getStatusColor = (status: Audit['status']) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-700';
    case 'in_progress': return 'bg-purple-100 text-purple-700';
    case 'completed': return 'bg-green-100 text-green-700';
  }
};

const getStatusLabel = (status: Audit['status']) => {
  switch (status) {
    case 'scheduled': return 'Запланирован';
    case 'in_progress': return 'В процессе';
    case 'completed': return 'Завершен';
  }
};

const getPassRate = (audit: Audit) => {
  if (audit.findings.length === 0) return 0;
  const passed = audit.findings.filter(f => f.result === 'pass').length;
  return Math.round((passed / audit.findings.length) * 100);
};

export default function AuditCard({ audit, checklistName }: AuditCardProps) {
  const passRate = getPassRate(audit);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{checklistName}</h3>
              <Badge className={getStatusColor(audit.status)}>
                {getStatusLabel(audit.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Icon name="Calendar" size={14} />
                <span>Запланирован: {new Date(audit.scheduledDate).toLocaleDateString('ru-RU')}</span>
              </div>
              {audit.completedDate && (
                <div className="flex items-center gap-1">
                  <Icon name="CheckCircle2" size={14} className="text-green-600" />
                  <span>Завершен: {new Date(audit.completedDate).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </div>
          </div>
          {audit.status === 'completed' && (
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">{passRate}%</div>
              <p className="text-xs text-gray-600">соответствие</p>
            </div>
          )}
        </div>

        {audit.findings.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Результаты проверки:</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 bg-green-50 rounded text-center">
                <Icon name="CheckCircle2" className="mx-auto mb-1 text-green-600" size={20} />
                <p className="text-xs text-gray-600">Соответствует</p>
                <p className="font-bold text-green-700">
                  {audit.findings.filter(f => f.result === 'pass').length}
                </p>
              </div>
              <div className="p-2 bg-red-50 rounded text-center">
                <Icon name="XCircle" className="mx-auto mb-1 text-red-600" size={20} />
                <p className="text-xs text-gray-600">Не соответствует</p>
                <p className="font-bold text-red-700">
                  {audit.findings.filter(f => f.result === 'fail').length}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <Icon name="Minus" className="mx-auto mb-1 text-gray-600" size={20} />
                <p className="text-xs text-gray-600">Не применимо</p>
                <p className="font-bold text-gray-700">
                  {audit.findings.filter(f => f.result === 'n/a').length}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Icon name="Eye" className="mr-2" size={14} />
            Подробнее
          </Button>
          {audit.status === 'scheduled' && (
            <Button size="sm" variant="secondary">
              <Icon name="Play" className="mr-2" size={14} />
              Начать проверку
            </Button>
          )}
          {audit.status === 'in_progress' && (
            <Button size="sm">
              <Icon name="Save" className="mr-2" size={14} />
              Продолжить
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
