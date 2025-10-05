import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Employee {
  id: string;
  name: string;
  position: string;
  nextCert: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  daysLeft: number;
}

interface UpcomingAttestationCardProps {
  employee: Employee;
}

export default function UpcomingAttestationCard({ employee }: UpcomingAttestationCardProps) {
  return (
    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">{employee.name}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{employee.position}</p>
        </div>
        <Badge variant={employee.status === 'expired' ? 'destructive' : 'secondary'} className="text-xs">
          {employee.daysLeft < 0 ? 'Просрочено' : `${employee.daysLeft} дн.`}
        </Badge>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
        <Icon name="Calendar" size={12} />
        <span>{new Date(employee.nextCert).toLocaleDateString('ru-RU')}</span>
      </div>
    </div>
  );
}
