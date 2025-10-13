import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { isDocumentExpired, isDocumentExpiringSoon } from '../../utils/documentValidation';

interface DocumentStatusBadgeProps {
  expiryDate?: string;
}

export default function DocumentStatusBadge({ expiryDate }: DocumentStatusBadgeProps) {
  if (!expiryDate) {
    return <Badge variant="outline">Не указано</Badge>;
  }

  if (isDocumentExpired(expiryDate)) {
    return (
      <Badge variant="destructive">
        <Icon name="XCircle" size={12} className="mr-1" />
        Истек
      </Badge>
    );
  }

  if (isDocumentExpiringSoon(expiryDate)) {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
        <Icon name="AlertTriangle" size={12} className="mr-1" />
        {format(new Date(expiryDate), 'dd.MM.yyyy', { locale: ru })}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-green-700">
      <Icon name="CheckCircle" size={12} className="mr-1" />
      {format(new Date(expiryDate), 'dd.MM.yyyy', { locale: ru })}
    </Badge>
  );
}
