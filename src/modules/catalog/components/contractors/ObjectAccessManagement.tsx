import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const ObjectAccessManagement = () => {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Icon name="ShieldCheck" size={48} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Управление доступом к объектам</h3>
        <p className="text-muted-foreground mb-4">
          Здесь будет управление назначением персонала на объекты и контроль соответствия требованиям
        </p>
        <p className="text-sm text-muted-foreground">
          В разработке: назначение на объекты, проверка компетенций, журнал доступа
        </p>
      </CardContent>
    </Card>
  );
};

export default ObjectAccessManagement;
