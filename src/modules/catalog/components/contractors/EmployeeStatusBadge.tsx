import { Badge } from '@/components/ui/badge';
import { EmployeeStatus } from '../../types/contractors';

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus;
}

export default function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  const variants: Record<
    EmployeeStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  > = {
    active: { label: 'Активен', variant: 'default' },
    suspended: { label: 'Приостановлен', variant: 'secondary' },
    blocked: { label: 'Заблокирован', variant: 'destructive' },
    dismissed: { label: 'Уволен', variant: 'outline' },
  };

  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
