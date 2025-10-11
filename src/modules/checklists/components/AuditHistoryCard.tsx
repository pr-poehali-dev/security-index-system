import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { Audit, Checklist, Organization } from '@/types';

interface AuditHistoryCardProps {
  audit: Audit;
  checklist?: Checklist;
  organization?: Organization;
  onPrintReport: (audit: Audit) => void;
  onDownloadPDF: (audit: Audit) => void;
}

export default function AuditHistoryCard({
  audit,
  checklist,
  organization,
  onPrintReport,
  onDownloadPDF
}: AuditHistoryCardProps) {
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

  const passRate = getPassRate(audit);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{checklist?.name}</h3>
              <Badge className={getStatusColor(audit.status)}>
                {getStatusLabel(audit.status)}
              </Badge>
            </div>

            <div className="space-y-1 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Icon name="Building2" size={14} />
                <span>{organization?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={14} />
                <span>
                  Запланирован: {new Date(audit.scheduledDate).toLocaleDateString('ru-RU')}
                </span>
              </div>
              {audit.completedDate && (
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={14} className="text-green-600" />
                  <span>
                    Завершен: {new Date(audit.completedDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              )}
            </div>

            {audit.status === 'completed' && audit.findings.length > 0 && (
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 bg-green-50 rounded text-center">
                  <p className="text-xs text-gray-600 mb-1">Соответствует</p>
                  <p className="font-bold text-green-700">
                    {audit.findings.filter(f => f.result === 'pass').length}
                  </p>
                </div>
                <div className="p-2 bg-red-50 rounded text-center">
                  <p className="text-xs text-gray-600 mb-1">Не соответствует</p>
                  <p className="font-bold text-red-700">
                    {audit.findings.filter(f => f.result === 'fail').length}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                  <p className="text-xs text-gray-600 mb-1">Не применимо</p>
                  <p className="font-bold text-gray-700">
                    {audit.findings.filter(f => f.result === 'n/a').length}
                  </p>
                </div>
              </div>
            )}
          </div>

          {audit.status === 'completed' && (
            <div className="text-right ml-6">
              <div className="text-3xl font-bold mb-1">{passRate}%</div>
              <p className="text-xs text-gray-600">соответствие</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" className="gap-2">
            <Icon name="Eye" size={14} />
            Просмотр
          </Button>
          {audit.status === 'completed' && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => onPrintReport(audit)}
              >
                <Icon name="Printer" size={14} />
                Печать
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => onDownloadPDF(audit)}
              >
                <Icon name="Download" size={14} />
                PDF
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}