import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useCatalogStore } from '@/stores/catalogStore';
import type { IndustrialObject } from '@/types/catalog';

interface ObjectTableViewProps {
  objects: IndustrialObject[];
  onView: (object: IndustrialObject) => void;
  onEdit: (object: IndustrialObject) => void;
}

const getStatusColor = (status: IndustrialObject['status']) => {
  switch (status) {
    case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'conservation': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    case 'liquidated': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  }
};

const getStatusLabel = (status: IndustrialObject['status']) => {
  switch (status) {
    case 'active': return 'Активен';
    case 'conservation': return 'На консервации';
    case 'liquidated': return 'Ликвидирован';
  }
};

const getTypeLabel = (type: IndustrialObject['type']) => {
  switch (type) {
    case 'opo': return 'ОПО';
    case 'gts': return 'ГТС';
    case 'building': return 'Здание';
  }
};

export default function ObjectTableView({ objects, onView, onEdit }: ObjectTableViewProps) {
  const { organizations } = useCatalogStore();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isDateExpired = (date: string | undefined) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isDateSoon = (date: string | undefined) => {
    if (!date) return false;
    const diffDays = Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 90 && diffDays >= 0;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left p-3 font-semibold text-sm">Название</th>
              <th className="text-left p-3 font-semibold text-sm">Рег. номер</th>
              <th className="text-left p-3 font-semibold text-sm">Тип</th>
              <th className="text-left p-3 font-semibold text-sm">Организация</th>
              <th className="text-left p-3 font-semibold text-sm">Статус</th>
              <th className="text-left p-3 font-semibold text-sm">Следующая ЭПБ</th>
              <th className="text-left p-3 font-semibold text-sm">Ответственный</th>
              <th className="text-right p-3 font-semibold text-sm">Действия</th>
            </tr>
          </thead>
          <tbody>
            {objects.map((obj) => {
              const organization = organizations.find(org => org.id === obj.organizationId);
              
              return (
                <tr 
                  key={obj.id}
                  className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-start gap-2">
                      <Icon name="Building" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{obj.name}</p>
                        <p className="text-xs text-muted-foreground">{obj.location.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {obj.registrationNumber}
                    </code>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="whitespace-nowrap">
                      {getTypeLabel(obj.type)}
                      {obj.hazardClass && ` • ${obj.hazardClass}`}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <p className="text-sm">{organization?.name || '-'}</p>
                  </td>
                  <td className="p-3">
                    <Badge className={getStatusColor(obj.status)}>
                      {getStatusLabel(obj.status)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {obj.nextExpertiseDate ? (
                      <div className="flex items-center gap-1">
                        {isDateExpired(obj.nextExpertiseDate) && (
                          <Icon name="AlertCircle" size={14} className="text-red-500" />
                        )}
                        {isDateSoon(obj.nextExpertiseDate) && !isDateExpired(obj.nextExpertiseDate) && (
                          <Icon name="Clock" size={14} className="text-amber-500" />
                        )}
                        <span className={`text-sm ${
                          isDateExpired(obj.nextExpertiseDate)
                            ? 'text-red-600 font-semibold'
                            : isDateSoon(obj.nextExpertiseDate)
                            ? 'text-amber-600 font-semibold'
                            : ''
                        }`}>
                          {formatDate(obj.nextExpertiseDate)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <p className="text-sm">{obj.responsiblePerson}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(obj)}
                        title="Просмотр"
                      >
                        <Icon name="Eye" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(obj)}
                        title="Редактировать"
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
