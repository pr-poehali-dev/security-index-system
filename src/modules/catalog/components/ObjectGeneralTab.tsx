import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { IndustrialObject, Organization } from '@/types/catalog';
import { useReferencesStore } from '@/stores/referencesStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCatalogStore } from '@/stores/catalogStore';
import { HAZARD_CLASS_LABELS } from '@/constants/hazardClass';

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
  const { typicalOpoNames, dangerSigns, opoClassifications } = useReferencesStore();
  const { personnel, people, positions } = useSettingsStore();
  const { organizations } = useCatalogStore();
  
  const typicalName = object.typicalNameId ? typicalOpoNames.find(t => t.id === object.typicalNameId) : null;
  const owner = object.ownerId ? organizations.find(o => o.id === object.ownerId) : null;
  
  const responsiblePersonnel = object.responsiblePersonId ? personnel.find(p => p.id === object.responsiblePersonId) : null;
  const responsiblePerson = responsiblePersonnel ? people.find(p => p.id === responsiblePersonnel.personId) : null;
  const responsiblePosition = responsiblePersonnel ? positions.find(p => p.id === responsiblePersonnel.positionId) : null;
  
  const objectDangerSigns = object.dangerSigns?.map(id => dangerSigns.find(d => d.id === id)).filter(Boolean) || [];
  const objectClassifications = object.classifications?.map(id => opoClassifications.find(c => c.id === id)).filter(Boolean) || [];

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
              label="Эксплуатирующая организация"
              value={organization?.name}
            />
            {owner && (
              <InfoRow
                icon="Building"
                label="Собственник ОПО"
                value={owner.name}
              />
            )}
            {typicalName && (
              <InfoRow
                icon="Tag"
                label="Типовое наименование"
                value={`${typicalName.code} - ${typicalName.name}`}
              />
            )}
            {object.industryCode && (
              <InfoRow
                icon="Hash"
                label="Код отраслевой принадлежности"
                value={object.industryCode}
              />
            )}
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
              value={responsiblePerson && responsiblePosition 
                ? `${responsiblePerson.lastName} ${responsiblePerson.firstName} ${responsiblePerson.middleName || ''} — ${responsiblePosition.name}`.trim()
                : object.responsiblePerson
              }
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

      {object.detailedAddress && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="MapPin" size={18} />
              Местоположение
            </h3>
            <div className="space-y-1 divide-y">
              <InfoRow
                icon="Home"
                label="Полный адрес"
                value={object.detailedAddress.fullAddress}
              />
              {object.detailedAddress.region && (
                <InfoRow
                  icon="Map"
                  label="Субъект РФ"
                  value={object.detailedAddress.region}
                />
              )}
              {object.detailedAddress.oktmo && (
                <InfoRow
                  icon="Hash"
                  label="ОКТМО"
                  value={object.detailedAddress.oktmo}
                />
              )}
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
      )}

      {!object.detailedAddress && (
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
      )}

      {(objectDangerSigns.length > 0 || objectClassifications.length > 0 || object.hazardClass) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="AlertTriangle" size={18} />
              Классификация и опасности
            </h3>
            <div className="space-y-4">
              {objectDangerSigns.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Признаки опасности (ФЗ-116 Ст.2):</p>
                  <div className="space-y-2">
                    {objectDangerSigns.map((sign) => (
                      <div key={sign!.id} className="flex items-start gap-2">
                        <Badge variant="outline">{sign!.code}</Badge>
                        <span className="text-sm">{sign!.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {objectClassifications.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Классификационные признаки:</p>
                  <div className="space-y-2">
                    {objectClassifications.map((cls) => (
                      <div key={cls!.id} className="flex items-start gap-2">
                        <Badge variant="outline">{cls!.code}</Badge>
                        <span className="text-sm">{cls!.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {object.hazardClass && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Класс опасности ОПО:</p>
                  <Badge variant="default">{HAZARD_CLASS_LABELS[object.hazardClass]}</Badge>
                  {object.hazardClassJustification && (
                    <p className="text-sm mt-2 p-3 bg-muted rounded">{object.hazardClassJustification}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}