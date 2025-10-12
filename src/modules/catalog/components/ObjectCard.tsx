import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { IndustrialObject } from '@/types/catalog';

interface ObjectCardProps {
  object: IndustrialObject;
  onView?: (object: IndustrialObject) => void;
  onEdit?: (object: IndustrialObject) => void;
}

const getStatusColor = (status: IndustrialObject['status']) => {
  switch (status) {
    case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'conservation': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    case 'liquidated': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  }
};

const getStatusLabel = (status: IndustrialObject['status']) => {
  switch (status) {
    case 'active': return 'Активен';
    case 'conservation': return 'На консервации';
    case 'liquidated': return 'Ликвидирован';
  }
};

const getTypeLabel = (type: IndustrialObject['type']) => {
  switch (type) {
    case 'opo': return 'ОПО';
    case 'gts': return 'ГТС';
    case 'building': return 'Здание';
  }
};

const getTypeIcon = (type: IndustrialObject['type']) => {
  switch (type) {
    case 'opo': return 'Factory';
    case 'gts': return 'Waves';
    case 'building': return 'Building';
  }
};

const getTypeColor = (type: IndustrialObject['type']) => {
  switch (type) {
    case 'opo': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
    case 'gts': return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400';
    case 'building': return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const isExpirationSoon = (date: string | undefined) => {
  if (!date) return false;
  const diffDays = Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 90 && diffDays >= 0;
};

const isExpired = (date: string | undefined) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

const ObjectCard = memo(function ObjectCard({ object: obj, onView, onEdit }: ObjectCardProps) {
  const needsAttention = isExpired(obj.nextExpertiseDate) || 
                        isExpired(obj.nextDiagnosticDate) || 
                        isExpired(obj.nextTestDate);
  
  return (
    <Card className={`hover-scale ${needsAttention ? 'border-red-300 dark:border-red-800' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(obj.type)}`}>
              <Icon name={getTypeIcon(obj.type)} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{obj.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{obj.registrationNumber}</p>
            </div>
          </div>
          <Badge className={getStatusColor(obj.status)}>
            {getStatusLabel(obj.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{getTypeLabel(obj.type)}</Badge>
          {obj.hazardClass && (
            <Badge variant="outline">Класс {obj.hazardClass}</Badge>
          )}
          {obj.category && (
            <Badge variant="secondary" className="text-xs max-w-[200px] truncate">
              {obj.category}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Icon name="MapPin" size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-foreground line-clamp-2">{obj.location.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="User" size={16} className="text-muted-foreground flex-shrink-0" />
            <span className="text-foreground truncate">{obj.responsiblePerson}</span>
          </div>
          
          {obj.nextExpertiseDate && (
            <div className="flex items-center gap-2">
              <Icon name="FileCheck" size={16} className="text-muted-foreground flex-shrink-0" />
              <span className={`
                ${isExpired(obj.nextExpertiseDate) ? 'text-red-600 dark:text-red-400 font-medium' : ''}
                ${isExpirationSoon(obj.nextExpertiseDate) ? 'text-amber-600 dark:text-amber-400' : ''}
              `}>
                ЭПБ: {new Date(obj.nextExpertiseDate).toLocaleDateString('ru-RU')}
                {isExpired(obj.nextExpertiseDate) && ' (просрочено)'}
                {isExpirationSoon(obj.nextExpertiseDate) && !isExpired(obj.nextExpertiseDate) && ' (скоро)'}
              </span>
            </div>
          )}
          
          {obj.nextDiagnosticDate && (
            <div className="flex items-center gap-2">
              <Icon name="Stethoscope" size={16} className="text-muted-foreground flex-shrink-0" />
              <span className={`
                ${isExpired(obj.nextDiagnosticDate) ? 'text-red-600 dark:text-red-400 font-medium' : ''}
                ${isExpirationSoon(obj.nextDiagnosticDate) ? 'text-amber-600 dark:text-amber-400' : ''}
              `}>
                Диагностика: {new Date(obj.nextDiagnosticDate).toLocaleDateString('ru-RU')}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView?.(obj)}
          >
            <Icon name="Eye" className="mr-1" size={14} />
            Просмотр
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit?.(obj)}
          >
            <Icon name="Edit" size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export default ObjectCard;);

export default ObjectCard;