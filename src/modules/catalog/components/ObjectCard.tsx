import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface CatalogObject {
  id: string;
  code: string;
  name: string;
  type: string;
  hazardClass: string;
  status: string;
  location: { address: string };
  responsiblePerson: string;
  nextExaminationDate?: string;
}

interface ObjectCardProps {
  object: CatalogObject;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emerald-100 text-emerald-700';
    case 'inactive': return 'bg-gray-100 text-gray-700';
    case 'decommissioned': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Активен';
    case 'inactive': return 'Неактивен';
    case 'decommissioned': return 'Ликвидирован';
    default: return status;
  }
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    industrial: 'ОПО',
    energy: 'Энергетика',
    mining: 'Горнодобывающий',
    chemical: 'Химический',
    gas: 'Газовый',
    building: 'Здание',
    other: 'Прочее'
  };
  return labels[type] || type;
};

export default function ObjectCard({ object: obj }: ObjectCardProps) {
  return (
    <Card className="hover-scale">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <Icon name="Building" className="text-emerald-600" size={24} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{obj.name}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">{obj.code}</p>
            </div>
          </div>
          <Badge className={getStatusColor(obj.status)}>
            {getStatusLabel(obj.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">{getTypeLabel(obj.type)}</Badge>
          <Badge variant="outline">Класс {obj.hazardClass}</Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Icon name="MapPin" size={16} className="text-gray-500 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300">{obj.location.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="User" size={16} className="text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">{obj.responsiblePerson}</span>
          </div>
          {obj.nextExaminationDate && (
            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={16} className="text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                Экспертиза: {new Date(obj.nextExaminationDate).toLocaleDateString('ru-RU')}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Icon name="Eye" className="mr-1" size={14} />
            Просмотр
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="FileText" size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
