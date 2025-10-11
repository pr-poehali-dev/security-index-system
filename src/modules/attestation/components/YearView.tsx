import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Certification {
  id: string;
  employeeName: string;
  employeePosition: string;
  department: string;
  category: string;
  area: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  daysLeft: number;
}

interface MonthData {
  month: number;
  name: string;
  total: number;
  expired: number;
  expiring: number;
  valid: number;
  certifications: Certification[];
}

interface YearViewProps {
  yearData: MonthData[];
  onMonthClick: (month: number) => void;
}

export default function YearView({ yearData, onMonthClick }: YearViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {yearData.map((month) => (
        <Card
          key={month.month}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onMonthClick(month.month)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base capitalize">{month.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Всего</span>
              <Badge variant="outline">{month.total}</Badge>
            </div>
            {month.total > 0 && (
              <>
                {month.expired > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-600 dark:text-red-400">Просрочено</span>
                    <span className="font-medium text-red-600 dark:text-red-400">{month.expired}</span>
                  </div>
                )}
                {month.expiring > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-amber-600 dark:text-amber-400">Истекает</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">{month.expiring}</span>
                  </div>
                )}
                {month.valid > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400">Действует</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{month.valid}</span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    {month.expired > 0 && (
                      <div
                        className="bg-red-500"
                        style={{ width: `${(month.expired / month.total) * 100}%` }}
                      />
                    )}
                    {month.expiring > 0 && (
                      <div
                        className="bg-amber-500"
                        style={{ width: `${(month.expiring / month.total) * 100}%` }}
                      />
                    )}
                    {month.valid > 0 && (
                      <div
                        className="bg-emerald-500"
                        style={{ width: `${(month.valid / month.total) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
