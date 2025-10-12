import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

interface ComplianceData {
  personnelId: string;
  personnelName: string;
  position: string;
  department: string;
  requiredCertifications: string[];
  actualCertifications: string[];
  expiringCertifications: string[];
  missingCertifications: string[];
  compliancePercent: number;
}

interface CompliancePersonnelCardProps {
  item: ComplianceData;
  isSelected: boolean;
  onSelect: (personnelId: string, checked: boolean) => void;
  onToast: (title: string, description: string) => void;
}

export default function CompliancePersonnelCard({
  item,
  isSelected,
  onSelect,
  onToast,
}: CompliancePersonnelCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(item.personnelId, checked as boolean)}
            className="mt-1 mr-3"
          />
          <div>
            <h3 className="font-semibold">{item.personnelName}</h3>
            <p className="text-sm text-muted-foreground">{item.position} • {item.department}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-bold ${
              item.compliancePercent === 100 ? 'text-emerald-600' :
              item.compliancePercent >= 50 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {item.compliancePercent}%
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all ${
              item.compliancePercent === 100 ? 'bg-emerald-600' :
              item.compliancePercent >= 50 ? 'bg-amber-600' : 'bg-red-600'
            }`}
            style={{ width: `${item.compliancePercent}%` }}
          />
        </div>

        <div className="space-y-4">
          {item.requiredCertifications.length > 0 ? (
            <>
              <div>
                <p className="font-medium mb-3 flex items-center gap-2">
                  <Icon name="ClipboardCheck" size={16} className="text-muted-foreground" />
                  Требуемые области аттестации ({item.requiredCertifications.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {item.requiredCertifications.map((cert, i) => {
                    const hasValidCert = item.actualCertifications.includes(cert);
                    const isExpiring = item.expiringCertifications.includes(cert);
                    
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                          hasValidCert && !isExpiring
                            ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
                            : isExpiring
                            ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
                            : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                        }`}
                      >
                        {hasValidCert && !isExpiring ? (
                          <Icon name="CheckCircle2" size={16} className="text-emerald-600 flex-shrink-0" />
                        ) : isExpiring ? (
                          <Icon name="AlertTriangle" size={16} className="text-amber-600 flex-shrink-0" />
                        ) : (
                          <Icon name="XCircle" size={16} className="text-red-600 flex-shrink-0" />
                        )}
                        <span className={`text-sm flex-1 ${
                          hasValidCert && !isExpiring
                            ? 'text-emerald-900 dark:text-emerald-100 font-medium'
                            : isExpiring
                            ? 'text-amber-900 dark:text-amber-100 font-medium'
                            : 'text-red-900 dark:text-red-100 font-medium'
                        }`}>
                          {cert}
                        </span>
                        {isExpiring && (
                          <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
                            Истекает
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={14} className="text-emerald-600" />
                  <span className="text-muted-foreground">
                    Действительные: <span className="font-medium text-emerald-600">
                      {item.actualCertifications.filter(a => !item.expiringCertifications.includes(a)).length}
                    </span>
                  </span>
                </div>
                {item.expiringCertifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Icon name="AlertTriangle" size={14} className="text-amber-600" />
                    <span className="text-muted-foreground">
                      Истекает: <span className="font-medium text-amber-600">{item.expiringCertifications.length}</span>
                    </span>
                  </div>
                )}
                {item.missingCertifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Icon name="XCircle" size={14} className="text-red-600" />
                    <span className="text-muted-foreground">
                      Отсутствует: <span className="font-medium text-red-600">{item.missingCertifications.length}</span>
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm bg-muted/50 rounded-md">
              Для должности "{item.position}" не определены требуемые области аттестации
            </div>
          )}
        </div>

        {(item.expiringCertifications.length > 0 || item.missingCertifications.length > 0) && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-3">Массовые действия:</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => {
                  const areas = [...new Set([...item.missingCertifications, ...item.expiringCertifications])];
                  onToast(
                    "Добавление в приказ",
                    `${areas.length} областей аттестации добавлено в приказ на подготовку для ${item.personnelName}`
                  );
                }}
              >
                <Icon name="FilePlus" size={14} />
                Добавить все в приказ ({item.missingCertifications.length + item.expiringCertifications.length})
              </Button>
              {item.missingCertifications.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    onToast(
                      "Добавление недостающих",
                      `${item.missingCertifications.length} недостающих областей добавлено в приказ для ${item.personnelName}`
                    );
                  }}
                >
                  <Icon name="XCircle" size={14} />
                  Только недостающие ({item.missingCertifications.length})
                </Button>
              )}
              {item.expiringCertifications.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                  onClick={() => {
                    onToast(
                      "Добавление истекающих",
                      `${item.expiringCertifications.length} истекающих областей добавлено в приказ для ${item.personnelName}`
                    );
                  }}
                >
                  <Icon name="AlertTriangle" size={14} />
                  Только истекающие ({item.expiringCertifications.length})
                </Button>
              )}
              <Button 
                size="sm" 
                className="gap-2 ml-auto"
                onClick={() => {
                  onToast(
                    "Направление на обучение",
                    `${item.personnelName} направлен на обучение`
                  );
                }}
              >
                <Icon name="GraduationCap" size={14} />
                Направить на обучение
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
