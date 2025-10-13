import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import { ViewModeToggle } from '@/components/ui/view-mode-toggle';
import type { CompetencyMatrix } from '@/types';
import { CERTIFICATION_CATEGORIES } from '@/lib/constants';
import ImportCompetenciesDialog from '../ImportCompetenciesDialog';
import { exportToExcel } from '@/lib/exportUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CompetenciesTabProps {
  onAdd: () => void;
  onEdit: (competency: CompetencyMatrix) => void;
  onDelete: (id: string) => void;
}

export default function CompetenciesTab({ onAdd, onEdit, onDelete }: CompetenciesTabProps) {
  const user = useAuthStore((state) => state.user);
  const { competencies, getOrganizationsByTenant } = useSettingsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [showImport, setShowImport] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    const saved = localStorage.getItem('competencies-view-mode');
    return (saved as 'table' | 'cards') || 'table';
  });

  const handleViewModeChange = (mode: 'table' | 'cards') => {
    setViewMode(mode);
    localStorage.setItem('competencies-view-mode', mode);
  };

  const organizations = user?.tenantId ? getOrganizationsByTenant(user.tenantId) : [];
  const tenantCompetencies = competencies.filter((c) => c.tenantId === user?.tenantId);

  const filteredCompetencies = tenantCompetencies.filter((comp) => {
    const matchesSearch =
      (comp.position?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (organizations.find(o => o.id === comp.organizationId)?.name.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesOrg = filterOrg === 'all' || comp.organizationId === filterOrg;

    return matchesSearch && matchesOrg;
  });

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

  const getOrganizationName = (orgId: string) => {
    return organizations.find(o => o.id === orgId)?.name || '—';
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <p className="text-sm text-muted-foreground">
            Всего записей: {tenantCompetencies.length}
          </p>
          <div className="flex gap-2">
            <ViewModeToggle
              value={viewMode}
              onChange={handleViewModeChange}
              modes={['cards', 'table']}
            />
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

        <div className="flex items-center gap-4 flex-wrap">
          <Input
            placeholder="Поиск по должности или организации..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72"
          />
          <Select value={filterOrg} onValueChange={setFilterOrg}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Организация" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все организации</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {viewMode === 'table' ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Должность</TableHead>
                    <TableHead>Организация</TableHead>
                    <TableHead>Требуемые области аттестации</TableHead>
                    <TableHead className="text-center">Всего областей</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompetencies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        <Icon name="Search" size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Записи не найдены</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompetencies.map((comp) => {
                      const totalAreas = comp.requiredAreas.reduce((sum, ra) => sum + ra.areas.length, 0);

                      return (
                        <TableRow key={comp.id}>
                          <TableCell className="font-medium">{comp.position}</TableCell>
                          <TableCell>{getOrganizationName(comp.organizationId)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {comp.requiredAreas.map((ra, idx) => {
                                const category = CERTIFICATION_CATEGORIES.find((c) => c.value === ra.category);
                                return (
                                  <div key={idx} className="space-y-1">
                                    <div className="text-xs font-medium text-muted-foreground">
                                      {category?.label} ({category?.code})
                                    </div>
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
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{totalAreas}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => onEdit(comp)}
                                disabled={isReadOnly}
                              >
                                <Icon name="Pencil" size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => onDelete(comp.id)}
                                disabled={isReadOnly}
                              >
                                <Icon name="Trash2" size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCompetencies.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Icon name="Search" size={48} className="mx-auto mb-4 opacity-20" />
                <p>Записи не найдены</p>
              </div>
            ) : (
              filteredCompetencies.map((comp) => {
                const totalAreas = comp.requiredAreas.reduce((sum, ra) => sum + ra.areas.length, 0);

                return (
                  <Card key={comp.id}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{comp.position}</h3>
                          <p className="text-sm text-muted-foreground">{getOrganizationName(comp.organizationId)}</p>
                        </div>
                        <Badge variant="outline">{totalAreas} обл.</Badge>
                      </div>

                      <div className="space-y-2">
                        {comp.requiredAreas.map((ra, idx) => {
                          const category = CERTIFICATION_CATEGORIES.find((c) => c.value === ra.category);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">
                                {category?.label} ({category?.code})
                              </div>
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

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-2"
                          onClick={() => onEdit(comp)}
                          disabled={isReadOnly}
                        >
                          <Icon name="Pencil" size={14} />
                          Изменить
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onDelete(comp.id)}
                          disabled={isReadOnly}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>

      <ImportCompetenciesDialog 
        open={showImport} 
        onOpenChange={setShowImport}
      />
    </>
  );
}