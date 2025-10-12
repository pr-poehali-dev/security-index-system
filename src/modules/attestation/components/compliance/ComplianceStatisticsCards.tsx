import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ComplianceStatisticsCardsProps {
  stats: {
    totalEmployees: number;
    fullCompliance: number;
    partialCompliance: number;
    avgCompliance: number;
  };
}

export default function ComplianceStatisticsCards({ stats }: ComplianceStatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Users" className="text-blue-600" size={24} />
            <span className="text-2xl font-bold">{stats.totalEmployees}</span>
          </div>
          <p className="text-sm text-muted-foreground">Всего сотрудников</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
            <span className="text-2xl font-bold">{stats.fullCompliance}</span>
          </div>
          <p className="text-sm text-muted-foreground">Полное соответствие</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="AlertTriangle" className="text-amber-600" size={24} />
            <span className="text-2xl font-bold">{stats.partialCompliance}</span>
          </div>
          <p className="text-sm text-muted-foreground">Частичное соответствие</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Target" className="text-purple-600" size={24} />
            <span className="text-2xl font-bold">{stats.avgCompliance}%</span>
          </div>
          <p className="text-sm text-muted-foreground">Средний уровень</p>
        </CardContent>
      </Card>
    </div>
  );
}
