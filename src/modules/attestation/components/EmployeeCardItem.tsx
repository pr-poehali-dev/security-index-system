import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import type { Employee } from '../utils/employeeUtils';
import { getEmployeeStatus, getStatusColor, getStatusLabel, getStatusIcon } from '../utils/employeeUtils';

interface EmployeeCardItemProps {
  employee: Employee;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onViewDetails: () => void;
}

export default function EmployeeCardItem({
  employee,
  isSelected,
  onSelect,
  onViewDetails
}: EmployeeCardItemProps) {
  const status = getEmployeeStatus(employee);

  return (
    <Card className={`hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{employee.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                  <Icon name={getStatusIcon(status) as any} size={12} className="inline mr-1" />
                  {getStatusLabel(status)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                <Icon name="Building2" size={14} className="inline mr-1" />
                {employee.organization}
              </p>
              <p className="text-sm text-muted-foreground">{employee.position} • {employee.department}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Аттестаций: {employee.certifications.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewDetails}
              className="gap-2"
            >
              <Icon name="Eye" size={14} />
              Подробнее
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="Edit" size={16} />
            </Button>
          </div>
        </div>

        <div className="pt-3 border-t space-y-2">
          {employee.certifications.slice(0, 2).map((cert) => (
            <div key={cert.id} className="flex items-start justify-between text-sm">
              <div className="flex-1">
                <p className="font-medium">{cert.category}</p>
                <p className="text-muted-foreground text-xs">{cert.area}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-medium ${
                  cert.status === 'valid' ? 'text-emerald-600' :
                  cert.status === 'expiring_soon' ? 'text-amber-600' : 'text-red-600'
                }`}>
                  до {new Date(cert.expiryDate).toLocaleDateString('ru')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {cert.daysLeft > 0 ? `${cert.daysLeft} дн.` : 'Просрочено'}
                </p>
              </div>
            </div>
          ))}
          {employee.certifications.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={onViewDetails}
            >
              Показать все ({employee.certifications.length})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
