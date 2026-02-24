import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import ReportPeriodSelector from '@/components/dashboard/ReportPeriodSelector';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ReportPeriod } from '@/utils/reportGenerator';

class ChartErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.warn('Chart error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
          <Icon name="TrendingUp" size={16} className="mr-2 opacity-50" />
          Не удалось отобразить график
        </div>
      );
    }
    return this.props.children;
  }
}

interface TasksChartCardProps {
  data: Array<{
    date: string;
    'Открыто': number;
    'В работе': number;
    'Завершено': number;
  }>;
  onGenerateReport: (period: ReportPeriod) => Promise<void>;
}

export default function TasksChartCard({ data, onGenerateReport }: TasksChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="TrendingUp" size={20} className="text-emerald-600" />
            Динамика задач за 30 дней
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
        <ChartErrorBoundary>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
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
                <Line 
                  type="monotone" 
                  dataKey="Открыто" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="В работе" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Завершено" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartErrorBoundary>
      </CardContent>
    </Card>
  );
}
