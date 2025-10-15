import { Badge } from '@/components/ui/badge';
import { useCatalogStore } from '@/stores/catalogStore';
import { useReferencesStore } from '@/stores/referencesStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { WizardFormData } from './OpoFormWizard';
import Icon from '@/components/ui/icon';
import { HAZARD_CLASS_LABELS, HAZARD_CLASS_COLORS } from '@/constants/hazardClass';

interface Step5ReviewProps {
  formData: WizardFormData;
}

export default function Step5Review({ formData }: Step5ReviewProps) {
  const { organizations } = useCatalogStore();
  const { typicalOpoNames, dangerSigns, opoClassifications, licensedActivities } = useReferencesStore();
  const { personnel, people, positions } = useSettingsStore();

  const organization = organizations.find(org => org.id === formData.organizationId);
  const owner = organizations.find(org => org.id === formData.ownerId);
  const typicalName = typicalOpoNames.find(tn => tn.id === formData.typicalNameId);
  
  const responsiblePersonnel = personnel.find(p => p.id === formData.responsiblePersonId);
  const responsiblePerson = responsiblePersonnel ? people.find(p => p.id === responsiblePersonnel.personId) : null;
  const responsiblePosition = responsiblePersonnel ? positions.find(p => p.id === responsiblePersonnel.positionId) : null;
  
  const responsiblePersonDisplay = responsiblePerson && responsiblePosition
    ? `${responsiblePerson.lastName} ${responsiblePerson.firstName} ${responsiblePerson.middleName || ''} — ${responsiblePosition.name}`.trim()
    : null;

  const selectedDangerSigns = formData.dangerSigns.map(id => dangerSigns.find(ds => ds.id === id)).filter(Boolean);
  const selectedClassifications = formData.classifications.map(id => opoClassifications.find(cls => cls.id === id)).filter(Boolean);
  const selectedActivities = formData.licensedActivities.map(id => licensedActivities.find(la => la.id === id)).filter(Boolean);

  const fullAddress = `${formData.postalCode ? formData.postalCode + ', ' : ''}${formData.region}, ${formData.city}, ${formData.street}, ${formData.building}`;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Проверка данных</h3>
        
        <div className="space-y-6">
          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="FileText" size={20} className="text-primary" />
              <h4 className="font-semibold">Основные сведения</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Наименование:</span>
                <span className="col-span-2 font-medium">{formData.name || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Рег. номер:</span>
                <span className="col-span-2 font-medium">{formData.registrationNumber || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Типовое наименование:</span>
                <span className="col-span-2">{typicalName?.name || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Код отрасли:</span>
                <span className="col-span-2">{formData.industryCode || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Адрес:</span>
                <span className="col-span-2">{fullAddress}</span>
              </div>
              {formData.oktmo && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">ОКТМО:</span>
                  <span className="col-span-2">{formData.oktmo}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Дата ввода:</span>
                <span className="col-span-2">{formData.commissioningDate ? new Date(formData.commissioningDate).toLocaleDateString('ru-RU') : '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Организация:</span>
                <span className="col-span-2">{organization?.name || '—'}</span>
              </div>
              {owner && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Собственник:</span>
                  <span className="col-span-2">{owner.name}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Ответственное лицо:</span>
                <span className="col-span-2">
                  {responsiblePersonDisplay || '—'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Статус:</span>
                <span className="col-span-2">
                  <Badge variant={formData.status === 'active' ? 'default' : 'secondary'}>
                    {formData.status === 'active' ? 'Активен' : formData.status === 'conservation' ? 'На консервации' : 'Ликвидирован'}
                  </Badge>
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="AlertTriangle" size={20} className="text-orange-600" />
              <h4 className="font-semibold">Признаки опасности</h4>
            </div>
            {selectedDangerSigns.length > 0 ? (
              <div className="space-y-2">
                {selectedDangerSigns.map((sign) => (
                  <div key={sign!.id} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="mt-0.5">{sign!.code}</Badge>
                    <span>{sign!.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Не указаны</p>
            )}
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Tags" size={20} className="text-blue-600" />
              <h4 className="font-semibold">Классификация</h4>
            </div>
            <div className="space-y-3">
              {selectedClassifications.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Классификационные признаки:</span>
                  {selectedClassifications.map((cls) => (
                    <div key={cls!.id} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="mt-0.5">{cls!.code}</Badge>
                      <span>{cls!.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Классификации не указаны</p>
              )}
              
              {formData.hazardClass && (
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">Класс опасности:</span>
                    <Badge className={HAZARD_CLASS_COLORS[formData.hazardClass]}>
                      {HAZARD_CLASS_LABELS[formData.hazardClass]}
                    </Badge>
                  </div>
                  {formData.hazardClassJustification && (
                    <p className="text-sm mt-2 p-2 bg-muted rounded">{formData.hazardClassJustification}</p>
                  )}
                </div>
              )}

              {selectedActivities.length > 0 && (
                <div className="pt-3 border-t">
                  <span className="text-sm text-muted-foreground mb-2 block">Лицензируемые виды деятельности:</span>
                  {selectedActivities.map((activity) => (
                    <div key={activity!.id} className="text-sm">
                      <Badge variant="secondary" className="mr-2">{activity!.code}</Badge>
                      {activity!.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {formData.description && (
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="FileText" size={20} className="text-primary" />
                <h4 className="font-semibold">Описание</h4>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}