import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Incident } from '@/types';

interface RiskMatrixProps {
  incidents: Incident[];
  categories: Array<{ id: string; name: string }>;
}

export default function RiskMatrix({ incidents, categories }: RiskMatrixProps) {
  const riskData = useMemo(() => {
    const categoryRisks: Record<string, { 
      count: number; 
      overdue: number; 
      avgDaysLeft: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    }> = {};

    incidents.forEach((inc) => {
      const catName = categories.find(c => c.id === inc.categoryId)?.name || 'Без категории';
      
      if (!categoryRisks[catName]) {
        categoryRisks[catName] = { 
          count: 0, 
          overdue: 0, 
          avgDaysLeft: 0,
          riskLevel: 'low'
        };
      }

      categoryRisks[catName].count++;
      
      if (inc.status === 'overdue') {
        categoryRisks[catName].overdue++;
      }
      
      if (inc.status === 'awaiting' || inc.status === 'in_progress') {
        categoryRisks[catName].avgDaysLeft += inc.daysLeft;
      }
    });

    Object.keys(categoryRisks).forEach((catName) => {
      const data = categoryRisks[catName];
      const overdueRate = data.count > 0 ? (data.overdue / data.count) * 100 : 0;
      const activeIncidents = incidents.filter(inc => 
        (categories.find(c => c.id === inc.categoryId)?.name || 'Без категории') === catName &&
        (inc.status === 'awaiting' || inc.status === 'in_progress')
      ).length;
      
      data.avgDaysLeft = activeIncidents > 0 
        ? Math.round(data.avgDaysLeft / activeIncidents) 
        : 0;

      if (overdueRate > 50 || (data.count > 10 && overdueRate > 30)) {
        data.riskLevel = 'critical';
      } else if (overdueRate > 30 || data.count > 15) {
        data.riskLevel = 'high';
      } else if (overdueRate > 15 || data.count > 10) {
        data.riskLevel = 'medium';
      } else {
        data.riskLevel = 'low';
      }
    });

    return Object.entries(categoryRisks)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => {
        const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      });
  }, [incidents, categories]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical':
        return 'Критический';
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
      default:
        return 'Неизвестно';
    }
  };

  if (incidents.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Матрица рисков по категориям</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Анализ частоты и серьезности инцидентов по категориям
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskData.slice(0, 9).map((item) => {
              const overdueRate = item.count > 0 
                ? Math.round((item.overdue / item.count) * 100) 
                : 0;

              return (
                <div
                  key={item.name}
                  className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(item.riskLevel)} flex-shrink-0 ml-2 mt-1`} />
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Уровень риска:</span>
                      <span className="font-medium">{getRiskLabel(item.riskLevel)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Всего инцидентов:</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Просрочено:</span>
                      <span className={`font-medium ${overdueRate > 30 ? 'text-red-600' : ''}`}>
                        {item.overdue} ({overdueRate}%)
                      </span>
                    </div>
                    
                    {item.avgDaysLeft > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Средний срок:</span>
                        <span className={`font-medium ${item.avgDaysLeft < 5 ? 'text-orange-600' : ''}`}>
                          {item.avgDaysLeft} дн.
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            overdueRate > 50 ? 'bg-red-500' :
                            overdueRate > 30 ? 'bg-orange-500' :
                            overdueRate > 15 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${overdueRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-6 pt-4 border-t text-sm">
            <span className="text-muted-foreground">Уровни риска:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Критический (&gt;50% просрочки)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Высокий (&gt;30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Средний (&gt;15%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Низкий</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
