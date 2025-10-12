import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const EmployeesList = () => {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Персонал подрядчиков</h3>
        <p className="text-muted-foreground mb-4">
          Здесь будет отображаться список сотрудников подрядных организаций
        </p>
        <p className="text-sm text-muted-foreground">
          В разработке: список персонала, аттестации, допуски
        </p>
      </CardContent>
    </Card>
  );
};

export default EmployeesList;
