import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { IndustrialObject } from '@/types/catalog';

interface ObjectDatesTabProps {
  object: IndustrialObject;
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const isDateExpired = (date: string | undefined) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

const isDateSoon = (date: string | undefined) => {
  if (!date) return false;
  const diffDays = Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 90 && diffDays >= 0;
};

interface DateCardProps {
  icon: string;
  title: string;
  date: string | undefined;
  expiredIconColor: string;
  soonIconColor: string;
  normalIconColor: string;
}

const DateCard = ({ icon, title, date, expiredIconColor, soonIconColor, normalIconColor }: DateCardProps) => {
  if (!date) return null;
  
  const expired = isDateExpired(date);
  const soon = isDateSoon(date);
  
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border">
      <Icon 
        name={icon}
        size={24} 
        className={`flex-shrink-0 mt-0.5 ${
          expired ? expiredIconColor : soon ? soonIconColor : normalIconColor
        }`}
      />
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className={`text-lg font-semibold mt-1 ${
          expired ? 'text-red-600' : soon ? 'text-amber-600' : ''
        }`}>
          {formatDate(date)}
        </p>
        {expired && (
          <Badge className="mt-2 bg-red-100 text-red-700">
            <Icon name="AlertCircle" size={12} className="mr-1" />
            Просрочено
          </Badge>
        )}
        {soon && !expired && (
          <Badge className="mt-2 bg-amber-100 text-amber-700">
            <Icon name="Clock" size={12} className="mr-1" />
            Скоро истекает
          </Badge>
        )}
      </div>
    </div>
  );
};

export default function ObjectDatesTab({ object }: ObjectDatesTabProps) {
  const hasAnyDates = object.nextExpertiseDate || object.nextDiagnosticDate || object.nextTestDate;
  
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Icon name="Calendar" size={18} />
          Даты экспертиз и диагностики
        </h3>
        <div className="space-y-4">
          <DateCard
            icon="FileCheck"
            title="Экспертиза промышленной безопасности (ЭПБ)"
            date={object.nextExpertiseDate}
            expiredIconColor="text-red-500"
            soonIconColor="text-amber-500"
            normalIconColor="text-blue-500"
          />

          <DateCard
            icon="Stethoscope"
            title="Техническое диагностирование"
            date={object.nextDiagnosticDate}
            expiredIconColor="text-red-500"
            soonIconColor="text-amber-500"
            normalIconColor="text-green-500"
          />

          <DateCard
            icon="Gauge"
            title="Испытания"
            date={object.nextTestDate}
            expiredIconColor="text-red-500"
            soonIconColor="text-amber-500"
            normalIconColor="text-purple-500"
          />

          {!hasAnyDates && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Calendar" className="mx-auto mb-2" size={48} />
              <p>Даты не указаны</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
