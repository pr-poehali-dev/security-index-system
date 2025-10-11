import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface EmployeeStatisticsCardsProps {
  totalCertifications: number;
  validCertifications: number;
  expiringCertifications: number;
  expiredCertifications: number;
}

export default function EmployeeStatisticsCards({
  totalCertifications,
  validCertifications,
  expiringCertifications,
  expiredCertifications
}: EmployeeStatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Award" className="text-blue-600" size={24} />
            <span className="text-2xl font-bold">{totalCertifications}</span>
          </div>
          <p className="text-sm text-muted-foreground">Всего аттестаций</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
            <span className="text-2xl font-bold">{validCertifications}</span>
          </div>
          <p className="text-sm text-muted-foreground">Действующие допуски</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="AlertTriangle" className="text-amber-600" size={24} />
            <span className="text-2xl font-bold">{expiringCertifications}</span>
          </div>
          <p className="text-sm text-muted-foreground">Истекают (30 дней)</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="XCircle" className="text-red-600" size={24} />
            <span className="text-2xl font-bold">{expiredCertifications}</span>
          </div>
          <p className="text-sm text-muted-foreground">Просрочено</p>
        </CardContent>
      </Card>
    </div>
  );
}