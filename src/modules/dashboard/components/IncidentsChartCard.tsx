import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import ReportPeriodSelector from '@/components/dashboard/ReportPeriodSelector';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ReportPeriod } from '@/utils/reportGenerator';

interface IncidentsChartCardProps {
  data: Array<{
    date: string;
    'Критический': number;
    'Высокий': number;
    'Средний': number;
    'Низкий': number;
  }>;
  onGenerateReport: (period: ReportPeriod) => Promise<void>;
}

export default function IncidentsChartCard({ data, onGenerateReport }: IncidentsChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} className="text-red-600" />
            Инциденты по приоритетам за 30 дней
          </CardTitle>
          <ReportPeriodSelector 
            onGenerateReport={onGenerateReport}
            variant="ghost"
            size="sm"
            showLabel={false}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }} 
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="Критический" stackId="a" fill="#ef4444" />
            <Bar dataKey="Высокий" stackId="a" fill="#f97316" />
            <Bar dataKey="Средний" stackId="a" fill="#eab308" />
            <Bar dataKey="Низкий" stackId="a" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
