import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Organization {
  id: string;
  name: string;
  inn: string;
  type: string;
}

interface OrganizationCardProps {
  organization: Organization;
  objectsCount: number;
}

export default function OrganizationCard({ organization: org, objectsCount }: OrganizationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Icon name="Building2" className="text-blue-600" size={20} />
          </div>
          <div>
            <CardTitle className="text-base">{org.name}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">ИНН: {org.inn}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            {org.type === 'holding' ? 'Холдинг' : org.type === 'legal_entity' ? 'Юр.лицо' : 'Филиал'}
          </Badge>
          <span className="text-sm text-gray-600">
            Объектов: {objectsCount}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
