import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAttestationStore } from '@/stores/attestationStore';
import { 
  CERTIFICATION_CATEGORIES, 
  CERTIFICATION_AREAS_BY_CATEGORY,
  INDUSTRIAL_SAFETY_AREAS,
  ENERGY_SAFETY_AREAS,
  LABOR_SAFETY_AREAS,
  ECOLOGY_AREAS
} from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';

export default function DirectoriesTab() {
  const user = useAuthStore((state) => state.user);
  const { competencies, getOrganizationsByTenant, getExternalOrganizationsByType } = useSettingsStore();
  const { getCertificationTypesByTenant } = useAttestationStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const certTypes = user?.tenantId ? getCertificationTypesByTenant(user.tenantId) : [];
  
  const organizations = user?.tenantId ? getOrganizationsByTenant(user.tenantId) : [];
  const tenantCompetencies = competencies.filter((c) => c.tenantId === user?.tenantId);
  const trainingOrganizations = user?.tenantId ? getExternalOrganizationsByType(user.tenantId, 'training_center') : [];
  
  const filteredTemplates = tenantCompetencies.filter(comp => {
    const orgName = organizations.find(o => o.id === comp.organizationId)?.name || '';
    return comp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
           orgName.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const filteredTrainingOrgs = trainingOrganizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.inn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cert-types" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cert-types" className="gap-2">
            <Icon name="Award" size={16} />
            Виды аттестаций
          </TabsTrigger>
          <TabsTrigger value="organizations" className="gap-2">
            <Icon name="Building2" size={16} />
            Учебные центры
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Icon name="FileCheck" size={16} />
            Требования к должностям
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cert-types">
          <Card>
            <CardHeader>
              <CardTitle>Справочник видов аттестаций и допусков</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по коду или названию области..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {CERTIFICATION_CATEGORIES.map((category) => {
                  const areas = CERTIFICATION_AREAS_BY_CATEGORY[category.value as keyof typeof CERTIFICATION_AREAS_BY_CATEGORY];
                  const filteredAreas = areas.filter(area => 
                    area.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    area.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  
                  if (searchQuery && filteredAreas.length === 0) return null;

                  return (
                    <Collapsible key={category.value} defaultOpen={!searchQuery || filteredAreas.length > 0}>
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                                  <Icon name="Award" size={20} className="text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{category.label}</CardTitle>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {filteredAreas.length} {filteredAreas.length === 1 ? 'область' : filteredAreas.length < 5 ? 'области' : 'областей'}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-base px-3 py-1">
                                {category.code}
                              </Badge>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {filteredAreas.map((area) => (
                                <div 
                                  key={area.code}
                                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-center justify-center min-w-[60px] h-9 px-3 rounded-md bg-primary/10 text-primary font-mono text-sm font-semibold">
                                    {area.code}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-relaxed">{area.name}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>

              {searchQuery && CERTIFICATION_CATEGORIES.every(category => {
                const areas = CERTIFICATION_AREAS_BY_CATEGORY[category.value as keyof typeof CERTIFICATION_AREAS_BY_CATEGORY];
                return areas.filter(area => 
                  area.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  area.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0;
              }) && (
                <div className="text-center py-12">
                  <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Ничего не найдено</p>
                  <p className="text-sm text-muted-foreground">Измените параметры поиска</p>
                </div>
              )}

              <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        О справочнике
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Справочник содержит все области аттестации по промышленной безопасности, энергобезопасности, 
                        охране труда и экологии согласно требованиям Ростехнадзора и законодательства РФ.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Учебные центры и организации</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию или ИНН..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {filteredTrainingOrgs.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Building2" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Учебные центры не найдены</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? 'Измените параметры поиска' : 'Учебные центры настраиваются в модуле "Настройки"'}
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = '/settings'} className="gap-2">
                    <Icon name="Settings" size={16} />
                    Перейти в настройки
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTrainingOrgs.map((org) => (
                    <Card key={org.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{org.name}</h3>
                              {org.status === 'inactive' && (
                                <Badge variant="secondary">Неактивен</Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              {org.inn && (
                                <span className="flex items-center gap-1">
                                  <Icon name="FileText" size={14} />
                                  ИНН: {org.inn}
                                </span>
                              )}
                              {org.contactPerson && (
                                <span className="flex items-center gap-1">
                                  <Icon name="User" size={14} />
                                  {org.contactPerson}
                                </span>
                              )}
                              {org.phone && (
                                <span className="flex items-center gap-1">
                                  <Icon name="Phone" size={14} />
                                  {org.phone}
                                </span>
                              )}
                              {org.email && (
                                <span className="flex items-center gap-1">
                                  <Icon name="Mail" size={14} />
                                  {org.email}
                                </span>
                              )}
                              {org.website && (
                                <span className="flex items-center gap-1">
                                  <Icon name="Globe" size={14} />
                                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    {org.website.replace('https://', '')}
                                  </a>
                                </span>
                              )}
                            </div>
                            {org.address && (
                              <p className="text-sm text-muted-foreground mt-2 flex items-start gap-1">
                                <Icon name="MapPin" size={14} className="mt-0.5" />
                                {org.address}
                              </p>
                            )}
                            {org.accreditations && org.accreditations.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <Icon name="Award" size={14} className="text-muted-foreground" />
                                <div className="flex flex-wrap gap-1">
                                  {org.accreditations.map((acc, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {acc}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Об учебных центрах
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Справочник учебных центров отображает данные из модуля "Настройки" → "Сторонние организации" (тип: Учебный центр).
                        Для редактирования перейдите в раздел настроек.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Требования к должностям</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по должности или организации..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="FileCheck" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Требования не найдены</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? 'Измените параметры поиска' : 'Требования к должностям настраиваются в модуле "Настройки"'}
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = '/settings'} className="gap-2">
                    <Icon name="Settings" size={16} />
                    Перейти в настройки
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTemplates.map((template) => {
                    const organization = organizations.find(o => o.id === template.organizationId);
                    
                    return (
                      <Card key={template.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{template.position}</h3>
                                <Badge variant="secondary">
                                  {organization?.name || 'Без организации'}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-2">Требуемые области аттестации:</p>
                                <div className="space-y-2">
                                  {template.requiredAreas.map((area, idx) => {
                                    const category = CERTIFICATION_CATEGORIES.find(c => c.value === area.category);
                                    return (
                                      <div key={idx} className="ml-4">
                                        <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                          <Icon name="Award" size={14} />
                                          {category?.label || area.category}
                                        </p>
                                        <ul className="space-y-1 ml-5">
                                          {area.areas.map((subArea, subIdx) => (
                                            <li key={subIdx} className="text-sm text-muted-foreground flex items-center gap-2">
                                              <Icon name="CheckCircle2" size={14} className="text-emerald-600" />
                                              {subArea}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        О требованиях к должностям
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Данный справочник отображает требования к должностям из модуля "Настройки" → "Шаблон компетенций".
                        Для редактирования требований перейдите в раздел настроек.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}