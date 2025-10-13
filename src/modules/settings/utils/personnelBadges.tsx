import { Badge } from '@/components/ui/badge';
import type { Personnel, PersonnelType } from '@/types';

export function getRoleBadge(role: Personnel['role']) {
  const variants = {
    Auditor: 'default',
    Manager: 'secondary',
    Director: 'destructive',
    Contractor: 'outline'
  } as const;
  
  const labels = {
    Auditor: 'Аудитор',
    Manager: 'Менеджер',
    Director: 'Директор',
    Contractor: 'Подрядчик'
  };

  return <Badge variant={variants[role]}>{labels[role]}</Badge>;
}

export function getTypeBadge(type: PersonnelType) {
  return type === 'employee' 
    ? <Badge variant="default" className="text-xs">Штатный</Badge>
    : <Badge variant="secondary" className="text-xs">Подрядчик</Badge>;
}

export function getStatusBadge(status: Personnel['status']) {
  return (
    <Badge variant={status === 'active' ? 'default' : 'secondary'}>
      {status === 'active' ? 'Активен' : 'Неактивен'}
    </Badge>
  );
}
