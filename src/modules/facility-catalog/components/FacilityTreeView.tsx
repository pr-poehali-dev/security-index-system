import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Facility } from '@/types/facilities';
import { Organization } from '@/types';
import { cn } from '@/lib/utils';
import { useFacilitiesStore } from '@/stores/facilitiesStore';

interface FacilityTreeViewProps {
  organizations: Organization[];
  facilities: Facility[];
  onAddOpo: (organizationId: string) => void;
  onAddTuZs: (parentOpoId: string, subType: 'tu' | 'zs') => void;
  onEdit: (facility: Facility) => void;
  onDelete: (facilityId: string) => void;
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

export default function FacilityTreeView({
  organizations,
  facilities,
  onAddOpo,
  onAddTuZs,
  onEdit,
  onDelete,
}: FacilityTreeViewProps) {
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [expandedOpos, setExpandedOpos] = useState<Set<string>>(new Set());

  const toggleOrg = (orgId: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  const toggleOpo = (opoId: string) => {
    const newExpanded = new Set(expandedOpos);
    if (newExpanded.has(opoId)) {
      newExpanded.delete(opoId);
    } else {
      newExpanded.add(opoId);
    }
    setExpandedOpos(newExpanded);
  };

  const { getComponentsByFacility } = useFacilitiesStore();

  const getOposByOrganization = (orgId: string) => {
    return facilities.filter(f => f.organizationId === orgId && f.type === 'opo');
  };

  const getTuZsByOpo = (opoId: string, subType: 'tu' | 'zs') => {
    const components = getComponentsByFacility(opoId);
    return components.filter(c => 
      subType === 'tu' ? c.type === 'technical_device' : c.type === 'building_structure'
    );
  };

  if (organizations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Организации не найдены. Сначала добавьте организацию.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {organizations.map((org) => {
        const isOrgExpanded = expandedOrgs.has(org.id);
        const opos = getOposByOrganization(org.id);

        return (
          <Card key={org.id} className="overflow-hidden">
            <div
              className={cn(
                "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                isOrgExpanded && "bg-muted/30"
              )}
              onClick={() => toggleOrg(org.id)}
            >
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOrg(org.id);
                }}
              >
                <Icon name={isOrgExpanded ? "ChevronDown" : "ChevronRight"} size={16} />
              </Button>

              <div className="flex-shrink-0 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Icon name="Building2" size={20} className="text-blue-600 dark:text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{org.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ИНН: {org.inn} • ОПО: {opos.length}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddOpo(org.id);
                }}
              >
                <Icon name="Plus" size={14} className="mr-1" />
                Добавить ОПО
              </Button>
            </div>

            {isOrgExpanded && (
              <CardContent className="pt-0 pb-4 px-4 space-y-2">
                {opos.length === 0 ? (
                  <div className="ml-9 text-sm text-muted-foreground py-2">
                    Нет ОПО. Добавьте опасный производственный объект.
                  </div>
                ) : (
                  opos.map((opo) => {
                    const isOpoExpanded = expandedOpos.has(opo.id);
                    const tuList = getTuZsByOpo(opo.id, 'tu');
                    const zsList = getTuZsByOpo(opo.id, 'zs');

                    return (
                      <Card key={opo.id} className="ml-9 overflow-hidden">
                        <div
                          className={cn(
                            "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                            isOpoExpanded && "bg-muted/30"
                          )}
                          onClick={() => toggleOpo(opo.id)}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOpo(opo.id);
                            }}
                          >
                            <Icon name={isOpoExpanded ? "ChevronDown" : "ChevronRight"} size={16} />
                          </Button>

                          <div className="flex-shrink-0 p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <Icon name="Factory" size={18} className="text-orange-600 dark:text-orange-400" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">{opo.fullName}</h4>
                              {opo.hazardClass && (
                                <Badge className={`${getHazardClassColor(opo.hazardClass)} text-xs`}>
                                  {opo.hazardClass}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              ТУ: {tuList.length} • ЗС: {zsList.length}
                              {opo.registrationNumber && ` • Рег. №: ${opo.registrationNumber}`}
                            </p>
                          </div>

                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => onEdit(opo)}
                            >
                              <Icon name="Pencil" size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => onDelete(opo.id)}
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </div>

                        {isOpoExpanded && (
                          <CardContent className="pt-0 pb-3 px-3 space-y-3">
                            <div className="ml-9 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon name="Cpu" size={16} className="text-muted-foreground" />
                                  <span className="font-medium text-sm">Технические устройства ({tuList.length})</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => onAddTuZs(opo.id, 'tu')}
                                >
                                  <Icon name="Plus" size={12} className="mr-1" />
                                  Добавить ТУ
                                </Button>
                              </div>

                              {tuList.length === 0 ? (
                                <div className="text-xs text-muted-foreground py-1 ml-6">
                                  Нет технических устройств
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {tuList.map((tu) => (
                                    <div
                                      key={tu.id}
                                      className="flex items-center gap-2 p-2 ml-6 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                      <Icon name="Wrench" size={14} className="text-muted-foreground flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{tu.fullName}</p>
                                        {tu.typicalName && (
                                          <p className="text-xs text-muted-foreground truncate">{tu.typicalName}</p>
                                        )}
                                      </div>
                                      {tu.hazardClass && (
                                        <Badge className={`${getHazardClassColor(tu.hazardClass)} text-xs`}>
                                          {tu.hazardClass}
                                        </Badge>
                                      )}
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0"
                                          onClick={() => onEdit(tu)}
                                        >
                                          <Icon name="Pencil" size={12} />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0"
                                          onClick={() => onDelete(tu.id)}
                                        >
                                          <Icon name="Trash2" size={12} />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="ml-9 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon name="Building" size={16} className="text-muted-foreground" />
                                  <span className="font-medium text-sm">Здания и сооружения ({zsList.length})</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => onAddTuZs(opo.id, 'zs')}
                                >
                                  <Icon name="Plus" size={12} className="mr-1" />
                                  Добавить ЗС
                                </Button>
                              </div>

                              {zsList.length === 0 ? (
                                <div className="text-xs text-muted-foreground py-1 ml-6">
                                  Нет зданий и сооружений
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {zsList.map((zs) => (
                                    <div
                                      key={zs.id}
                                      className="flex items-center gap-2 p-2 ml-6 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                      <Icon name="Home" size={14} className="text-muted-foreground flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{zs.fullName}</p>
                                        {zs.typicalName && (
                                          <p className="text-xs text-muted-foreground truncate">{zs.typicalName}</p>
                                        )}
                                      </div>
                                      {zs.hazardClass && (
                                        <Badge className={`${getHazardClassColor(zs.hazardClass)} text-xs`}>
                                          {zs.hazardClass}
                                        </Badge>
                                      )}
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0"
                                          onClick={() => onEdit(zs)}
                                        >
                                          <Icon name="Pencil" size={12} />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0"
                                          onClick={() => onDelete(zs.id)}
                                        >
                                          <Icon name="Trash2" size={12} />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}