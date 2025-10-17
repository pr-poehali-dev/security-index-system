import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function ContractorsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Building2" size={20} />
          Учебные центры
        </CardTitle>
        <CardDescription>
          Реестр учебных центров для организации обучения и аттестации персонала
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Icon name="Building2" size={48} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Раздел в разработке</h3>
          <p className="text-muted-foreground max-w-md">
            Здесь будет доступен учёт учебных центров для организации обучения персонала
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
