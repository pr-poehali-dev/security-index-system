import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface OrdersStatsProps {
  total: number;
  draft: number;
  active: number;
  completed: number;
}

export default function OrdersStats({ total, draft, active, completed }: OrdersStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего приказов</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <Icon name="FileText" size={24} className="text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Черновики</p>
              <p className="text-2xl font-bold">{draft}</p>
            </div>
            <Icon name="FilePen" size={24} className="text-gray-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Активные</p>
              <p className="text-2xl font-bold">{active}</p>
            </div>
            <Icon name="CheckCircle2" size={24} className="text-blue-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Исполнено</p>
              <p className="text-2xl font-bold">{completed}</p>
            </div>
            <Icon name="CheckCheck" size={24} className="text-emerald-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
