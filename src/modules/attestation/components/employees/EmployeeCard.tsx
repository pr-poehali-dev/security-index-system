import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { getCertificationStatusLabel, getCertificationStatusColor } from '@/modules/attestation/utils/statusHelpers';

interface Employee {
  id: string;
  name: string;
  position: string;
  nextCert: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  daysLeft: number;
}

interface EmployeeCardProps {
  employee: Employee;
}



export default function EmployeeCard({ employee }: EmployeeCardProps) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white">{employee.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{employee.position}</p>
        </div>
        <Badge className={getCertificationStatusColor(employee.status)}>
          {getCertificationStatusLabel(employee.status)}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-sm mb-2">
        <div className="flex items-center gap-2">
          <Icon name="Calendar" size={14} className="text-gray-500" />
          <span className="text-gray-700 dark:text-gray-300">
            Аттестация: {new Date(employee.nextCert).toLocaleDateString('ru-RU')}
          </span>
        </div>
        <span className={employee.daysLeft < 0 ? 'text-red-600' : employee.daysLeft <= 30 ? 'text-amber-600' : 'text-gray-600'}>
          {employee.daysLeft < 0 ? `Просрочено на ${Math.abs(employee.daysLeft)} дн.` : `Осталось ${employee.daysLeft} дн.`}
        </span>
      </div>
      <Progress value={Math.max(0, 100 - (employee.daysLeft / 365) * 100)} className="h-1" />
    </div>
  );
}