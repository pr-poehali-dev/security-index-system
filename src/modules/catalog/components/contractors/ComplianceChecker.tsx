import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { ContractorComplianceCheck } from '../../types/contractors';

interface ComplianceCheckerProps {
  check: ContractorComplianceCheck;
  className?: string;
}

const ComplianceChecker = ({ check, className = '' }: ComplianceCheckerProps) => {
  const hasIssues =
    check.missingCompetencies.length > 0 ||
    check.expiredAttestations.length > 0 ||
    check.missingDocuments.length > 0;

  const hasWarnings = check.expiringAttestations.length > 0;

  if (check.compliant && !hasWarnings) {
    return (
      <Card className={`p-4 bg-green-50 border-green-200 ${className}`}>
        <div className="flex items-start gap-3">
          <Icon name="CheckCircle2" size={20} className="text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900 mb-1">
              Сотрудник соответствует всем требованиям
            </h4>
            <p className="text-sm text-green-700">
              Все необходимые аттестации и документы в порядке
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {hasIssues && (
          <div
            className={`flex items-start gap-3 p-3 rounded-lg ${
              check.compliant ? 'bg-orange-50' : 'bg-red-50'
            }`}
          >
            <Icon
              name={check.compliant ? 'AlertTriangle' : 'XCircle'}
              size={20}
              className={`mt-0.5 ${check.compliant ? 'text-orange-600' : 'text-red-600'}`}
            />
            <div className="flex-1">
              <h4
                className={`font-medium mb-2 ${
                  check.compliant ? 'text-orange-900' : 'text-red-900'
                }`}
              >
                {check.compliant
                  ? 'Предупреждения о соответствии'
                  : 'Сотрудник не соответствует требованиям'}
              </h4>

              {check.missingCompetencies.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-red-800 mb-1">
                    Отсутствующие компетенции:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {check.missingCompetencies.map((comp, idx) => (
                      <Badge key={idx} variant="destructive" className="text-xs">
                        <Icon name="AlertCircle" size={12} className="mr-1" />
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {check.expiredAttestations.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-red-800 mb-1">Истекшие аттестации:</p>
                  <div className="flex flex-wrap gap-1">
                    {check.expiredAttestations.map((att, idx) => (
                      <Badge key={idx} variant="destructive" className="text-xs">
                        <Icon name="XCircle" size={12} className="mr-1" />
                        {att}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {check.missingDocuments.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">Отсутствующие документы:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {check.missingDocuments.map((doc, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Icon name="FileX" size={14} />
                        {doc.name}
                        {doc.expiryDate && (
                          <span className="text-xs text-red-600">
                            (истек {new Date(doc.expiryDate).toLocaleDateString('ru-RU')})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {check.expiringAttestations.length > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50">
            <Icon name="Clock" size={20} className="text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-orange-900 mb-2">Истекающие аттестации</h4>
              <div className="space-y-2">
                {check.expiringAttestations.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm text-orange-800"
                  >
                    <span>{att.area}</span>
                    <span className="flex items-center gap-2">
                      <Badge variant="outline" className="text-orange-700 border-orange-300">
                        {att.daysUntilExpiry} дн.
                      </Badge>
                      <span className="text-xs text-orange-600">
                        до {new Date(att.expiryDate).toLocaleDateString('ru-RU')}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ComplianceChecker;
