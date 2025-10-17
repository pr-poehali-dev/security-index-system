import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function ContractorsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Users" size={20} />
          Подрядчики на объектах
        </CardTitle>
        <CardDescription>
          Управление подрядными организациями и их сотрудниками на объектах
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Icon name="Users" size={48} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Раздел в разработке</h3>
          <p className="text-muted-foreground max-w-md">
            Здесь будет доступен учёт подрядных организаций, их сотрудников и допуска к объектам
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
