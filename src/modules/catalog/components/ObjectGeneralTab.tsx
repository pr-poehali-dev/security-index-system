import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { IndustrialObject, Organization } from '@/types/catalog';

interface ObjectGeneralTabProps {
  object: IndustrialObject;
  organization: Organization | undefined;
}

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string | undefined }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon name={icon} size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium break-words">{value}</p>
      </div>
    </div>
  );
};

const formatDate = (date: string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function ObjectGeneralTab({ object, organization }: ObjectGeneralTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="Info" size={18} />
            Общая информация
          </h3>
          <div className="space-y-1 divide-y">
            <InfoRow
              icon="Building"
              label="Организация"
              value={organization?.name}
            />
            <InfoRow
              icon="Tag"
              label="Категория"
              value={object.category}
            />
            <InfoRow
              icon="Calendar"
              label="Дата ввода в эксплуатацию"
              value={formatDate(object.commissioningDate)}
            />
            <InfoRow
              icon="User"
              label="Ответственное лицо"
              value={object.responsiblePerson}
            />
            {object.description && (
              <InfoRow
                icon="FileText"
                label="Описание"
                value={object.description}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="MapPin" size={18} />
            Местоположение
          </h3>
          <div className="space-y-1 divide-y">
            <InfoRow
              icon="MapPin"
              label="Адрес"
              value={object.location.address}
            />
            {object.location.coordinates && (
              <InfoRow
                icon="Navigation"
                label="Координаты"
                value={`${object.location.coordinates.lat.toFixed(6)}, ${object.location.coordinates.lng.toFixed(6)}`}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
