import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { Incident } from '@/types';

interface IncidentHeatmapProps {
  incidents: Incident[];
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function IncidentHeatmap({ incidents }: IncidentHeatmapProps) {
  const heatmapData = useMemo(() => {
    const dayData: number[] = [0, 0, 0, 0, 0, 0, 0];
    const hourData: number[] = new Array(24).fill(0);

    incidents.forEach(inc => {
      const date = new Date(inc.reportDate);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();
      
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      dayData[adjustedDay]++;
      hourData[hour]++;
    });

    const maxDayValue = Math.max(...dayData, 1);
    const maxHourValue = Math.max(...hourData, 1);

    return { dayData, hourData, maxDayValue, maxHourValue };
  }, [incidents]);

  const getIntensityColor = (value: number, maxValue: number) => {
    if (value === 0) return 'bg-slate-100 dark:bg-slate-800';
    
    const intensity = value / maxValue;
    
    if (intensity > 0.7) return 'bg-red-500 dark:bg-red-600';
    if (intensity > 0.5) return 'bg-orange-500 dark:bg-orange-600';
    if (intensity > 0.3) return 'bg-yellow-500 dark:bg-yellow-600';
    if (intensity > 0.1) return 'bg-blue-400 dark:bg-blue-600';
    return 'bg-blue-200 dark:bg-blue-800';
  };

  const totalIncidents = incidents.length;
  const peakDay = DAYS[heatmapData.dayData.indexOf(Math.max(...heatmapData.dayData))];
  const peakHour = heatmapData.hourData.indexOf(Math.max(...heatmapData.hourData));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего инцидентов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalIncidents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Пик активности (день)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{peakDay}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {Math.max(...heatmapData.dayData)} инцидентов
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Пик активности (час)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{peakHour}:00</div>
            <div className="text-sm text-muted-foreground mt-1">
              {Math.max(...heatmapData.hourData)} инцидентов
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Flame" size={18} />
            Тепловая карта инцидентов
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="text-sm font-medium mb-3">По дням недели</div>
          <div className="flex gap-2">
            {DAYS.map((day, index) => (
              <div key={day} className="flex-1 text-center">
                <div className="text-xs text-muted-foreground mb-2">{day}</div>
                <div
                  className={`h-16 rounded flex items-end justify-center pb-2 transition-colors ${getIntensityColor(
                    heatmapData.dayData[index],
                    heatmapData.maxDayValue
                  )}`}
                  title={`${day}: ${heatmapData.dayData[index]} инцидентов`}
                >
                  <span className="text-xs font-semibold text-white drop-shadow">
                    {heatmapData.dayData[index]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-3">По часам суток</div>
          <div className="grid grid-cols-12 gap-1">
            {HOURS.map(hour => {
              const count = heatmapData.hourData[hour];
              return (
                <div
                  key={hour}
                  className={`h-12 rounded flex flex-col items-center justify-center transition-colors ${getIntensityColor(
                    count,
                    heatmapData.maxHourValue
                  )}`}
                  title={`${hour}:00 - ${count} инцидентов`}
                >
                  <span className="text-[10px] text-muted-foreground">{hour}</span>
                  {count > 0 && (
                    <span className="text-xs font-semibold text-white drop-shadow">{count}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">Интенсивность:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800" title="Нет данных"></div>
            <div className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-800" title="Низкая"></div>
            <div className="w-4 h-4 rounded bg-blue-400 dark:bg-blue-600" title="Средняя"></div>
            <div className="w-4 h-4 rounded bg-yellow-500 dark:bg-yellow-600" title="Повышенная"></div>
            <div className="w-4 h-4 rounded bg-orange-500 dark:bg-orange-600" title="Высокая"></div>
            <div className="w-4 h-4 rounded bg-red-500 dark:bg-red-600" title="Критическая"></div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}