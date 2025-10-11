import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ReportPeriodSelector from '@/components/dashboard/ReportPeriodSelector';
import type { ReportPeriod } from '@/utils/reportGenerator';
import type { Organization, CatalogObject } from '@/types';

interface OrganizationsCardProps {
  organizations: Organization[];
  objects: CatalogObject[];
  onGenerateReport: (period: ReportPeriod) => Promise<void>;
  onNavigate: () => void;
}

export default function OrganizationsCard({ organizations, objects, onGenerateReport, onNavigate }: OrganizationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Building2" size={20} className="text-blue-600" />
            Организации
          </CardTitle>
          <div className="flex gap-2">
            <ReportPeriodSelector 
              onGenerateReport={onGenerateReport}
              variant="ghost"
              size="sm"
              showLabel={false}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {organizations.filter(org => !org.parentId).slice(0, 5).map((org) => {
            const orgObjects = objects.filter(obj => obj.organizationId === org.id);
            const activeObjects = orgObjects.filter(obj => obj.status === 'active');
            
            return (
              <div 
                key={org.id} 
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={onNavigate}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{org.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {org.type === 'holding' ? 'Холдинг' : 
                         org.type === 'legal_entity' ? 'Юр. лицо' : 'Филиал'}
                      </Badge>
                      {orgObjects.length > 0 && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {activeObjects.length} / {orgObjects.length} объектов
                        </span>
                      )}
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-gray-400 mt-1" />
                </div>
              </div>
            );
          })}
          {organizations.filter(org => !org.parentId).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Building2" size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Нет организаций</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
