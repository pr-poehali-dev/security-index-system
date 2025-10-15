import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

interface Certification {
  id: string;
  category: string;
  area: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  daysLeft: number;
  verified?: boolean;
}

interface CertificationItemProps {
  cert: Certification;
  isSelected: boolean;
  onToggle: () => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export default function CertificationItem({
  cert,
  isSelected,
  onToggle,
  getStatusColor,
  getStatusLabel,
}: CertificationItemProps) {
  const isExpiring = cert.status === 'expiring_soon';
  const isExpired = cert.status === 'expired';

  return (
    <div
      className={`p-3 hover:bg-muted/30 cursor-pointer transition-colors ${
        isSelected ? 'bg-primary/5' : ''
      } ${isExpiring ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''} ${
        isExpired ? 'bg-red-50/50 dark:bg-red-900/10' : ''
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <div className="flex-1">
              <div className="font-medium text-sm">{cert.area}</div>
              <div className="text-xs text-muted-foreground">{cert.category}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Icon name="Calendar" size={12} />
              Срок до {new Date(cert.expiryDate).toLocaleDateString('ru')}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={12} />
              Осталось {cert.daysLeft} дн.
            </span>
            {cert.verified && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Icon name="CheckCircle2" size={12} />
                Верифицирован
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className={getStatusColor(cert.status)}>
            {getStatusLabel(cert.status)}
          </Badge>
          {(isExpiring || isExpired) && (
            <div className="flex items-center gap-1 text-xs">
              <Icon 
                name="AlertTriangle" 
                size={12} 
                className={isExpired ? 'text-red-600' : 'text-amber-600'} 
              />
              <span className={isExpired ? 'text-red-600' : 'text-amber-600'}>
                {isExpired ? 'Требуется аттестация' : 'Скоро истекает'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
