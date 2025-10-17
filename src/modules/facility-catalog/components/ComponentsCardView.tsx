import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { FacilityComponent } from '@/types/facilities';

interface ComponentsCardViewProps {
  components: FacilityComponent[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const getTechnicalStatusColor = (status: string) => {
  switch (status) {
    case 'operating':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'needs_repair':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'needs_replacement':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'decommissioned':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const getTechnicalStatusLabel = (status: string) => {
  switch (status) {
    case 'operating':
      return 'Исправен';
    case 'needs_repair':
      return 'Требует ремонта';
    case 'needs_replacement':
      return 'Требует замены';
    case 'decommissioned':
      return 'Списан';
    default:
      return status;
  }
};

export default function ComponentsCardView({
  components,
  onEdit,
  onDelete,
}: ComponentsCardViewProps) {
  if (components.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Компоненты не найдены
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {components.map((component) => (
        <Card key={component.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  component.type === 'technical_device'
                    ? 'bg-purple-100 dark:bg-purple-900/30'
                    : 'bg-green-100 dark:bg-green-900/30'
                }`}>
                  <Icon
                    name={component.type === 'technical_device' ? 'Cpu' : 'Building'}
                    size={20}
                    className={
                      component.type === 'technical_device'
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-green-600 dark:text-green-400'
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {component.fullName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {component.type === 'technical_device'
                      ? 'Техническое устройство'
                      : 'Здание/Сооружение'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => onEdit(component.id)}
                >
                  <Icon name="Pencil" size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => onDelete(component.id)}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Icon name="Factory" size={14} className="text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate">{component.facilityName}</span>
              </div>

              {component.brand && (
                <div className="flex items-center gap-2">
                  <Icon name="Tag" size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">{component.brand}</span>
                </div>
              )}

              {component.factoryNumber && (
                <div className="flex items-center gap-2">
                  <Icon name="Hash" size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">
                    Зав. №: {component.factoryNumber}
                  </span>
                </div>
              )}

              {component.manufactureDate && (
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Изготовлен: {new Date(component.manufactureDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <Badge className={getTechnicalStatusColor(component.technicalStatus)}>
                {getTechnicalStatusLabel(component.technicalStatus)}
              </Badge>
              {component.registeredInRostechnadzor && (
                <Badge variant="outline" className="text-xs">
                  <Icon name="CheckCircle" size={12} className="mr-1" />
                  РТН
                </Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
