import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Facility } from '@/types/facilities';

interface FacilitiesGridProps {
  facilities: Facility[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const getHazardClassColor = (hazardClass?: string) => {
  switch (hazardClass) {
    case 'I':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'II':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'III':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'IV':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const getHazardClassIcon = (hazardClass?: string) => {
  switch (hazardClass) {
    case 'I':
      return 'AlertCircle';
    case 'II':
    case 'III':
      return 'AlertTriangle';
    case 'IV':
      return 'Shield';
    default:
      return 'HelpCircle';
  }
};

export default function FacilitiesGrid({
  facilities,
  onEdit,
  onDelete,
}: FacilitiesGridProps) {
  if (facilities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Объекты не найдены
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {facilities.map((facility) => (
        <Card key={facility.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {facility.type === 'opo' ? 'ОПО' : 'ГТС'}
                  </Badge>
                  {facility.hazardClass && (
                    <Badge className={`${getHazardClassColor(facility.hazardClass)} text-xs`}>
                      <Icon name={getHazardClassIcon(facility.hazardClass)} size={12} className="mr-1" />
                      {facility.hazardClass}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm leading-tight">
                  {facility.fullName}
                </h3>
                {facility.typicalName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {facility.typicalName}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onEdit(facility.id)}>
                  <Icon name="Pencil" size={14} />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onDelete(facility.id)}>
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Icon name="Building2" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-xs">{facility.organizationName}</span>
            </div>
            
            {facility.registrationNumber && (
              <div className="flex items-start gap-2">
                <Icon name="FileText" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-xs font-mono">{facility.registrationNumber}</span>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <Icon name="MapPin" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-xs line-clamp-2">{facility.address}</span>
            </div>
            
            {facility.responsiblePersonName && (
              <div className="flex items-start gap-2">
                <Icon name="User" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-xs">{facility.responsiblePersonName}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
