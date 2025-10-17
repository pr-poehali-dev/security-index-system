import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Facility } from '@/types/facilities';

interface FacilitiesGridProps {
  facilities: Facility[];
  onEdit: (facilityId: string) => void;
  onDelete: (facilityId: string) => void;
  getOrganizationName?: (orgId: string) => string;
}

export default function FacilitiesGrid({
  facilities,
  onEdit,
  onDelete,
  getOrganizationName,
}: FacilitiesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {facilities.map((facility) => (
        <Card key={facility.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Icon
                    name={facility.type === 'gts' ? 'Waves' : 'Factory'}
                    size={20}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{facility.fullName}</CardTitle>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              {facility.registrationNumber && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Hash" size={14} />
                  <span className="truncate">{facility.registrationNumber}</span>
                </div>
              )}
              {facility.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="MapPin" size={14} />
                  <span className="truncate">{facility.address}</span>
                </div>
              )}
              {getOrganizationName && facility.organizationId && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Building" size={14} />
                  <span className="truncate">{getOrganizationName(facility.organizationId)}</span>
                </div>
              )}
            </div>

            {facility.hazardClasses && facility.hazardClasses.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {facility.hazardClasses.map((hc, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    Класс {hc}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(facility.id)}
              >
                <Icon name="Edit" size={14} className="mr-1" />
                Изменить
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(facility.id)}
              >
                <Icon name="Trash2" size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
