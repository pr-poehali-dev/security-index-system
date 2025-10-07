import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import type { CompetencyMatrix } from '@/types';
import { CERTIFICATION_CATEGORIES } from '@/lib/constants';
import ImportCompetenciesDialog from './ImportCompetenciesDialog';
import { exportToExcel } from '@/lib/exportUtils';

interface CompetenciesTabProps {
  onAdd: () => void;
  onEdit: (competency: CompetencyMatrix) => void;
  onDelete: (id: string) => void;
}

export default function CompetenciesTab({ onAdd, onEdit, onDelete }: CompetenciesTabProps) {
  const user = useAuthStore((state) => state.user);
  const { competencies, getOrganizationsByTenant } = useSettingsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showImport, setShowImport] = useState(false);

  const organizations = user?.tenantId ? getOrganizationsByTenant(user.tenantId) : [];
  const tenantCompetencies = competencies.filter((c) => c.tenantId === user?.tenantId);

  const filteredCompetencies = tenantCompetencies.filter(
    (comp) =>
      comp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organizations.find(o => o.id === comp.organizationId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isReadOnly = user?.role !== 'TenantAdmin';

  const handleExport = () => {
    const data = filteredCompetencies.map((comp) => {
      const org = organizations.find((o) => o.id === comp.organizationId);
      const areas = comp.requiredAreas.map((ra) => {
        const category = CERTIFICATION_CATEGORIES.find((c) => c.value === ra.category);
        return `${category?.label}: ${ra.areas.join(', ')}`;
      }).join(' | ');

      return {
        'Организация': org?.name || '',
        'Должность': comp.position,
        'Требуемые области аттестации': areas,
        'Дата создания': new Date(comp.createdAt).toLocaleDateString('ru-RU'),
        'Дата обновления': new Date(comp.updatedAt).toLocaleDateString('ru-RU')
      };
    });

    exportToExcel(data, 'Справочник_компетенций');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Справочник компетенций</CardTitle>
            <div className="flex gap-2">
              {!isReadOnly && (
                <>
                  <Button onClick={() => setShowImport(true)} variant="outline" size="sm" className="gap-2">
                    <Icon name="Upload" size={16} />
                    Импорт
                  </Button>
                  <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
                    <Icon name="Download" size={16} />
                    Экспорт
                  </Button>
                  <Button onClick={onAdd} size="sm" className="gap-2">
                    <Icon name="Plus" size={16} />
                    Добавить
                  </Button>
                </>
              )}
              {isReadOnly && (
                <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
                  <Icon name="Download" size={16} />
                  Экспорт
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Поиск по должности или организации..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="space-y-3">
            {filteredCompetencies.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="GraduationCap" size={48} className="mx-auto mb-4 opacity-20" />
                <p>Нет записей в справочнике компетенций</p>
                {!isReadOnly && (
                  <Button onClick={onAdd} variant="outline" className="mt-4 gap-2">
                    <Icon name="Plus" size={16} />
                    Добавить первую запись
                  </Button>
                )}
              </div>
            ) : (
              filteredCompetencies.map((comp) => {
                const org = organizations.find((o) => o.id === comp.organizationId);
                
                return (
                  <Card key={comp.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{comp.position}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Icon name="Building2" size={14} />
                              {org?.name || 'Не указана'}
                            </p>
                          </div>

                          <div className="space-y-2">
                            {comp.requiredAreas.map((ra, idx) => {
                              const category = CERTIFICATION_CATEGORIES.find((c) => c.value === ra.category);
                              return (
                                <div key={idx} className="space-y-1">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {category?.label} ({category?.code})
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {ra.areas.map((area, aIdx) => (
                                      <Badge key={aIdx} variant="secondary" className="text-xs">
                                        {area}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Создано: {new Date(comp.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                            <span>
                              Обновлено: {new Date(comp.updatedAt).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>

                        {!isReadOnly && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onEdit(comp)}
                            >
                              <Icon name="Edit" size={16} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onDelete(comp.id)}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <ImportCompetenciesDialog open={showImport} onOpenChange={setShowImport} />
    </>
  );
}
